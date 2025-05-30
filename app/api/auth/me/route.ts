import { type NextRequest } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return Response.json({ error: "Invalid token" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("reels-platform")
    const users = db.collection("users")

    const user = await users.findOne(
      { _id: new ObjectId(decoded.userId) },
      { 
        projection: { 
          password: 0,
          _id: 1,
          username: 1,
          email: 1,
          bio: 1,
          createdAt: 1
        } 
      }
    )

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    return Response.json({
      user: {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        bio: user.bio || "",
        createdAt: user.createdAt || new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("Auth check error:", {
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
