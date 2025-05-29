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

    const client = await clientPromise
    const db = client.db("reels-platform")
    const reels = db.collection("reels")

    const reel = await reels.findOne({ _id: new ObjectId(params.id) })
    if (!reel) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 })
    }

    const userId = decoded.userId
    const likes = reel.likes || []
    const dislikes = reel.dislikes || []

    // Remove from dislikes if present
    const updatedDislikes = dislikes.filter((id: string) => id !== userId)

    // Toggle like
    let updatedLikes
    if (likes.includes(userId)) {
      updatedLikes = likes.filter((id: string) => id !== userId)
    } else {
      updatedLikes = [...likes, userId]
    }

    await reels.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          likes: updatedLikes,
          dislikes: updatedDislikes,
        },
      },
    )

    return NextResponse.json({
      likes: updatedLikes.length,
      dislikes: updatedDislikes.length,
      isLiked: updatedLikes.includes(userId),
      isDisliked: false,
    })
  } catch (error) {
    console.error("Like reel error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
