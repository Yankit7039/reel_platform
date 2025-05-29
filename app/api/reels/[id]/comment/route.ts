import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { text } = await request.json()
    if (!text) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("reels-platform")
    const reels = db.collection("reels")
    const users = db.collection("users")

    const user = await users.findOne({ _id: new ObjectId(decoded.userId) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const comment = {
      _id: new ObjectId().toString(),
      userId: decoded.userId,
      username: user.username,
      text,
      createdAt: new Date(),
    }

    await reels.updateOne({ _id: new ObjectId(params.id) }, { $push: { comments: comment } })

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Comment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
