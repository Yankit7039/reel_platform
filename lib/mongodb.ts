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
  socketTimeoutMS: 45000, // Close sockets that are inactive for 45 seconds
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds of server selection
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

const connectToDatabase = async () => {
  try {
    const client = new MongoClient(uri, options)
    await client.connect()
    await client.db("admin").command({ ping: 1 }) // Test the connection
    console.log("Successfully connected to MongoDB Atlas")
    return client
  } catch (error) {
    console.error("MongoDB Atlas connection error:", {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : error,
      uri: uri.replace(/mongodb(\+srv)?:\/\/[^:]+:[^@]+@/, 'mongodb$1://*:*@')
    })
    throw error
  }
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = connectToDatabase()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
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
