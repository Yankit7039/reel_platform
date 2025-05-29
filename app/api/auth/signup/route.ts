import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { hashPassword, generateToken } from "@/lib/auth"
import { MongoServerError } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    let body;
    try {
      body = await request.json()
    } catch (e) {
      console.error("Failed to parse request body:", e)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { username, email, password } = body

    // Log request data (excluding password)
    console.log("Signup attempt:", { username, email })

    // Validate required fields
    if (!username || !email || !password) {
      console.error("Missing required fields:", { username: !!username, email: !!email, password: !!password })
      return NextResponse.json({ 
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
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate username format (alphanumeric and underscore only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(username)) {
      console.error("Invalid username format:", username)
      return NextResponse.json({ error: "Username can only contain letters, numbers, and underscores" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      console.error("Password too short")
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    try {
      const client = await clientPromise
      console.log("MongoDB connected successfully")
      
      const db = client.db("reels-platform")
      const users = db.collection("users")

      // Check if user already exists
      const existingUser = await users.findOne({
        $or: [
          { email: email.toLowerCase() },
          { username: username }
        ]
      })

      if (existingUser) {
        const field = existingUser.email.toLowerCase() === email.toLowerCase() ? "email" : "username"
        console.error(`User already exists with ${field}:`, field === "email" ? email : username)
        return NextResponse.json({ 
          error: `${field === 'email' ? 'Email' : 'Username'} is already taken` 
        }, { status: 400 })
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password)
      const newUser = {
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        bio: "",
        createdAt: new Date(),
      }

      const result = await users.insertOne(newUser)
      console.log("User created successfully:", result.insertedId.toString())

      const user = {
        _id: result.insertedId.toString(),
        username,
        email: email.toLowerCase(),
        bio: "",
      }

      const token = generateToken(user._id)

      return NextResponse.json({ token, user })
    } catch (error) {
      if (error instanceof MongoServerError) {
        console.error("MongoDB operation failed:", {
          code: error.code,
          message: error.message,
          command: error.errInfo?.command
        })
        if (error.code === 11000) { // Duplicate key error
          return NextResponse.json({ error: "Username or email already exists" }, { status: 400 })
        }
      } else {
        console.error("Database operation failed:", error)
      }
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
