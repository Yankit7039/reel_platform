import { type NextRequest, NextResponse } from "next/server"
import clientPromise, { getGridFSBucket } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { Readable } from "stream"

export async function POST(request: NextRequest) {
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

    const formData = await request.formData()
    const file = formData.get("video") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string

    if (!file || !title || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("reels-platform")
    const users = db.collection("users")
    const reels = db.collection("reels")

    // Get user info
    const user = await users.findOne({ _id: new ObjectId(decoded.userId) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Upload video to GridFS
    const bucket = await getGridFSBucket()
    const buffer = Buffer.from(await file.arrayBuffer())
    const stream = Readable.from(buffer)

    const uploadStream = bucket.openUploadStream(file.name, {
      metadata: {
        userId: decoded.userId,
        originalName: file.name,
        contentType: file.type,
      },
    })

    stream.pipe(uploadStream)

    await new Promise((resolve, reject) => {
      uploadStream.on("finish", resolve)
      uploadStream.on("error", reject)
    })

    // Create reel document
    const reelData = {
      userId: decoded.userId,
      username: user.username,
      title,
      description: description || "",
      category,
      videoId: uploadStream.id.toString(),
      likes: [],
      dislikes: [],
      comments: [],
      createdAt: new Date(),
    }

    const result = await reels.insertOne(reelData)

    return NextResponse.json({
      _id: result.insertedId.toString(),
      ...reelData,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
