import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { verifyToken } from "@/lib/auth"
import type { Reel } from "@/lib/types"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)

    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updates = await request.json()
    const allowedUpdates = ["title", "description", "category"]
    const updateData: Partial<Reel> = {}

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updateData[key as keyof Reel] = updates[key]
      }
    })

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid updates provided" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("reels-platform")
    const reelsCollection = db.collection("reels")

    const reel = await reelsCollection.findOne({
      _id: new ObjectId(id),
      userId: user.userId
    })

    if (!reel) {
      return NextResponse.json({ error: "Reel not found or unauthorized" }, { status: 404 })
    }

    const result = await reelsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      },
      { returnDocument: "after" }
    )

    if (!result) {
      return NextResponse.json({ error: "Failed to update reel" }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating reel:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)

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
      userId: user.userId
    })

    if (!reel) {
      return NextResponse.json({ error: "Reel not found or unauthorized" }, { status: 404 })
    }

    const result = await reelsCollection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Failed to delete reel" }, { status: 400 })
    }

    return NextResponse.json({ message: "Reel deleted successfully" })
  } catch (error) {
    console.error("Error deleting reel:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
