"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CATEGORIES } from "@/lib/types"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"

export default function UploadForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [video, setVideo] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !video || !title || !category) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("video", video)
      formData.append("title", title)
      formData.append("description", description)
      formData.append("category", category)

      const token = localStorage.getItem("token")
      const response = await fetch("/api/reels/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (response.ok) {
        router.push("/")
      } else {
        setError("Failed to upload reel")
      }
    } catch (error) {
      console.error("Upload error:", error)
      setError("Failed to upload reel")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold text-center">Upload Reel</h1>

      <div>
        <label className="block text-sm font-medium mb-2">Video File</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideo(e.target.files?.[0] || null)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter reel title" required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter reel description"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Uploading..." : "Upload Reel"}
      </Button>
    </form>
  )
}
