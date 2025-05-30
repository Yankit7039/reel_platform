import { type NextRequest } from "next/server"
import clientPromise from "@/lib/mongodb"
import { comparePassword, generateToken } from "@/lib/auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json()
    } catch (e) {
      console.error("Failed to parse request body:", e)
      return Response.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      console.error("Missing credentials:", { email: !!email, password: !!password })
      return Response.json({ error: "Missing email or password" }, { status: 400 })
    }

    // Connect to MongoDB
    console.log("Connecting to MongoDB...")
    const client = await clientPromise
    const db = client.db("reels-platform")
    const users = db.collection("users")

    // Find user
    console.log("Looking up user:", email)
    const user = await users.findOne({ email: email.toLowerCase() })
    if (!user) {
      console.error("User not found:", email)
      return Response.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    console.log("Verifying password...")
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      console.error("Invalid password for user:", email)
      return Response.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate token
    console.log("Generating token for user:", email)
    const token = generateToken(user._id.toString())
    const userResponse = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      bio: user.bio || "",
    }

    // Create response with token cookie
    const headers = new Headers()
    headers.append(
      "Set-Cookie",
      `token=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Path=/`
    )

    console.log("Login successful for user:", email)
    return Response.json(
      { token, user: userResponse },
      { 
        headers,
        status: 200 
      }
    )
  } catch (error) {
    console.error("Login error:", {
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
