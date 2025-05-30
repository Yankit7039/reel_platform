import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { verifyToken } from "@/lib/auth"

export async function PUT(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const { id, commentId } = await Promise.resolve(params)

    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { text } = await request.json()
    if (!text?.trim()) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("reels-platform")
    const reelsCollection = db.collection("reels")

    const reel = await reelsCollection.findOne({
      _id: new ObjectId(id),
      comments: {
        $elemMatch: {
          _id: commentId,
          userId: user.userId
        }
      }
    })

    if (!reel) {
      return NextResponse.json({ error: "Comment not found or unauthorized" }, { status: 404 })
    }

    const result = await reelsCollection.updateOne(
      { 
        _id: new ObjectId(id),
        "comments._id": commentId
      },
      {
        $set: {
          "comments.$.text": text,
          "comments.$.updatedAt": new Date()
        }
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to update comment" }, { status: 400 })
    }

    return NextResponse.json({ message: "Comment updated successfully" })
  } catch (error) {
    console.error("Error updating comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const { id, commentId } = await Promise.resolve(params)

    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("reels-platform")
    const reelsCollection = db.collection("reels")

    const reel = await reelsCollection.findOne({
      _id: new ObjectId(id),
      comments: {
        $elemMatch: {
          _id: commentId,
          userId: user.userId
        }
      }
    })

    if (!reel) {
      return NextResponse.json({ error: "Comment not found or unauthorized" }, { status: 404 })
    }

    const result = await reelsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $pull: {
          comments: {
            _id: commentId,
            userId: user.userId
          }
        }
      } as any
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to delete comment" }, { status: 400 })
    }

    return NextResponse.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 