import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { verifyToken } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("reels-platform")
    const reels = db.collection("reels")

    const resolvedParams = await Promise.resolve(params)
    const { id } = resolvedParams

    const reel = await reels.findOne({ _id: new ObjectId(id) })
    if (!reel) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 })
    }

    const isLiked = reel.likes.includes(decoded.userId)
    const updatedLikes = isLiked
      ? reel.likes.filter((id: string) => id !== decoded.userId)
      : [...reel.likes, decoded.userId]

    const updatedDislikes = reel.dislikes.filter((id: string) => id !== decoded.userId)

    await reels.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          likes: updatedLikes,
          dislikes: updatedDislikes,
        },
      }
    )

    return NextResponse.json({ isLiked: !isLiked })
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
