"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CATEGORIES } from "@/lib/types"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { Upload, X, FileVideo, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useDropzone } from "react-dropzone"
import { useToast } from "@/hooks/use-toast"

export default function UploadForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [video, setVideo] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [videoPreview, setVideoPreview] = useState<string>("")
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type.startsWith('video/')) {
      setVideo(file)
      setVideoPreview(URL.createObjectURL(file))
      setError("")
    } else {
      setError("Please upload a valid video file")
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': []
    },
    maxFiles: 1,
    multiple: false
  })

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
        toast({
          title: "Success!",
          description: "Your reel has been uploaded successfully.",
        })
        router.push("/")
      } else {
        setError("Failed to upload reel")
        toast({
          title: "Error",
          description: "Failed to upload reel. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Upload error:", error)
      setError("Failed to upload reel")
      toast({
        title: "Error",
        description: "Failed to upload reel. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const removeVideo = () => {
    setVideo(null)
    setVideoPreview("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div 
          {...getRootProps()} 
          className={`relative border-2 border-dashed rounded-xl p-8 transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50/5' : 'border-gray-600 hover:border-gray-500'
          }`}
        >
          <input {...getInputProps()} />
          <AnimatePresence>
            {!video ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center"
              >
                <Upload className="w-12 h-12 mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-300">
                  {isDragActive ? "Drop your video here" : "Drag & drop your video here"}
                </p>
                <p className="text-sm text-gray-500 mt-2">or click to browse</p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative aspect-video rounded-lg overflow-hidden bg-gray-800"
              >
                <video
                  src={videoPreview}
                  className="w-full h-full object-cover"
                  controls
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeVideo}
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-sm truncate">
                    {video.name}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Enter reel title"
              className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter reel description"
              className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 min-h-[100px]"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-gray-800/50 border border-gray-700 rounded-md text-white"
              required
            >
              <option value="" className="bg-gray-800">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-gray-800">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"
          >
            {error}
          </motion.p>
        )}

        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-6 text-lg font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <FileVideo className="w-5 h-5 mr-2" />
              Upload Reel
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
