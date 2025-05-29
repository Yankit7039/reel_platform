import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    if (reel.userId !== decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await reels.deleteOne({ _id: new ObjectId(params.id) })

    return NextResponse.json({ message: "Reel deleted successfully" })
  } catch (error) {
    console.error("Delete reel error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
