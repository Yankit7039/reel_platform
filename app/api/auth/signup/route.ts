import { type NextRequest } from "next/server"
import clientPromise from "@/lib/mongodb"
import { hashPassword, generateToken } from "@/lib/auth"
import { MongoServerError } from "mongodb"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    let body;
    try {
      body = await request.json()
    } catch (e) {
      console.error("Failed to parse request body:", e)
      return Response.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { username, email, password } = body

    // Log request data (excluding password)
    console.log("Signup attempt:", { username, email })

    // Validate required fields
    if (!username || !email || !password) {
      console.error("Missing required fields:", { username: !!username, email: !!email, password: !!password })
      return Response.json({ 
        error: "Missing required fields",
        details: {
          username: !username ? "Username is required" : null,
          email: !email ? "Email is required" : null,
          password: !password ? "Password is required" : null
        }
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error("Invalid email format:", email)
      return Response.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate username format (alphanumeric and underscore only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(username)) {
      console.error("Invalid username format:", username)
      return Response.json({ error: "Username can only contain letters, numbers, and underscores" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      console.error("Password too short")
      return Response.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    try {
      console.log("Attempting to connect to MongoDB...")
      const client = await clientPromise
      console.log("MongoDB connected successfully")
      
      const db = client.db("reels-platform")
      const users = db.collection("users")

      // Check if user already exists
      console.log("Checking for existing user...")
      const existingUser = await users.findOne(
        {
          $or: [
            { email: email.toLowerCase() },
            { username: username }
          ]
        },
        {
          projection: {
            _id: 1,
            email: 1,
            username: 1
          }
        }
      )

      if (existingUser) {
        const field = existingUser.email.toLowerCase() === email.toLowerCase() ? "email" : "username"
        console.error(`User already exists with ${field}:`, field === "email" ? email : username)
        return Response.json({ 
          error: `${field === 'email' ? 'Email' : 'Username'} is already taken` 
        }, { status: 400 })
      }

      // Hash password and create user
      console.log("Hashing password...")
      const hashedPassword = await hashPassword(password)
      const newUser = {
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        bio: "",
        createdAt: new Date(),
      }

      console.log("Creating new user...")
      const result = await users.insertOne(newUser)
      console.log("User created successfully:", result.insertedId.toString())

      const user = {
        _id: result.insertedId.toString(),
        username,
        email: email.toLowerCase(),
        bio: "",
        createdAt: newUser.createdAt.toISOString()
      }

      console.log("Generating token...")
      const token = generateToken(user._id)

      // Create response with token cookie
      const headers = new Headers()
      headers.append(
        "Set-Cookie",
        `token=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Path=/`
      )

      return Response.json(
        { token, user },
        { 
          headers,
          status: 200 
        }
      )
    } catch (error) {
      if (error instanceof MongoServerError) {
        console.error("MongoDB operation failed:", {
          code: error.code,
          message: error.message,
          command: error.errInfo?.command,
          connectionInfo: {
            uri: process.env.MONGODB_URI ? "URI exists" : "URI missing",
            env: process.env.NODE_ENV
          }
        })
        if (error.code === 11000) { // Duplicate key error
          return Response.json({ error: "Username or email already exists" }, { status: 400 })
        }
      } else {
        console.error("Database operation failed:", {
          error: error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name
          } : error,
          env: {
            nodeEnv: process.env.NODE_ENV,
            hasMongoUri: !!process.env.MONGODB_URI,
            hasJwtSecret: !!process.env.JWT_SECRET
          }
        })
      }
      return Response.json({ error: "Failed to create user" }, { status: 500 })
    }
  } catch (error) {
    console.error("Signup error:", {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET
      }
    })
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
