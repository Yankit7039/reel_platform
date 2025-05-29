import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { hashPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("reels-platform")
    const users = db.collection("users")

    // Check if user already exists
    const existingUser = await users.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const result = await users.insertOne({
      username,
      email,
      password: hashedPassword,
      bio: "",
      createdAt: new Date(),
    })

    const user = {
      _id: result.insertedId.toString(),
      username,
      email,
      bio: "",
    }

    const token = generateToken(user._id)

    return NextResponse.json({ token, user })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
