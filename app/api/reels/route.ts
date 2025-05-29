import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const userId = searchParams.get("userId")

    const client = await clientPromise
    const db = client.db("reels-platform")
    const reels = db.collection("reels")

    const query: any = {}
    if (category && category !== "all") {
      query.category = category
    }
    if (userId) {
      query.userId = userId
    }

    const reelsList = await reels.find(query).sort({ createdAt: -1 }).toArray()

    const formattedReels = reelsList.map((reel) => ({
      ...reel,
      _id: reel._id.toString(),
    }))

    return NextResponse.json(formattedReels)
  } catch (error) {
    console.error("Fetch reels error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
