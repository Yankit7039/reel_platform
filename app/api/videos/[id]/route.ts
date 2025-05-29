import { type NextRequest, NextResponse } from "next/server"
import { getGridFSBucket } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params)
    const { id } = params
    const bucket = await getGridFSBucket()

    const downloadStream = bucket.openDownloadStream(new ObjectId(id))

    const chunks: Buffer[] = []

    return new Promise((resolve, reject) => {
      downloadStream.on("data", (chunk) => {
        chunks.push(chunk)
      })

      downloadStream.on("end", () => {
        const buffer = Buffer.concat(chunks)
        const response = new NextResponse(buffer, {
          headers: {
            "Content-Type": "video/mp4",
            "Content-Length": buffer.length.toString(),
          },
        })
        resolve(response)
      })

      downloadStream.on("error", (error) => {
        console.error("Video stream error:", error)
        reject(NextResponse.json({ error: "Video not found" }, { status: 404 }))
      })
    })
  } catch (error) {
    console.error("Video fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
