import { MongoClient, GridFSBucket } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  retryWrites: true,
  retryReads: true,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  keepAlive: true,
  keepAliveInitialDelay: 300000 // 5 minutes
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

const connectToDatabase = async () => {
  try {
    console.log("Attempting to connect to MongoDB...")
    const client = new MongoClient(uri, options)
    await client.connect()
    await client.db("admin").command({ ping: 1 })
    console.log("Successfully connected to MongoDB")
    return client
  } catch (error) {
    console.error("MongoDB connection error:", {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : error,
      uri: process.env.MONGODB_URI ? "URI exists" : "URI missing",
      env: process.env.NODE_ENV || "unknown"
    })
    throw error
  }
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = connectToDatabase()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = connectToDatabase()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

export async function getGridFSBucket() {
  const client = await clientPromise
  const db = client.db("reels-platform")
  return new GridFSBucket(db, { bucketName: "videos" })
}

export async function getDb() {
  const client = await clientPromise
  return client.db("reels-platform")
}

// Helper function to check if the connection is alive
export async function checkConnection() {
  try {
    const client = await clientPromise
    await client.db("admin").command({ ping: 1 })
    return true
  } catch (error) {
    console.error("MongoDB connection check failed:", error)
    return false
  }
}
