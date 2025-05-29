"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import type { Reel } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { LogOut, Trash2 } from "lucide-react"

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()
  const [userReels, setUserReels] = useState<Reel[]>([])
  const [loadingReels, setLoadingReels] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [loading, user, router])

  useEffect(() => {
    if (user) {
      fetchUserReels()
    }
  }, [user])

  const fetchUserReels = async () => {
    try {
      const response = await fetch(`/api/reels?userId=${user?._id}`)
      if (response.ok) {
        const data = await response.json()
        setUserReels(data)
      }
    } catch (error) {
      console.error("Failed to fetch user reels:", error)
    } finally {
      setLoadingReels(false)
    }
  }

  const handleDeleteReel = async (reelId: string) => {
    if (!confirm("Are you sure you want to delete this reel?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/reels/${reelId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setUserReels((prev) => prev.filter((reel) => reel._id !== reelId))
      }
    } catch (error) {
      console.error("Failed to delete reel:", error)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-600">{user.username.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.username}</h1>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500 mt-1">{userReels.length} reels</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">My Reels</h2>

        {loadingReels ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : userReels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven't uploaded any reels yet</p>
            <Button onClick={() => router.push("/upload")}>Upload Your First Reel</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userReels.map((reel) => (
              <div key={reel._id} className="relative group">
                <div className="aspect-[9/16] bg-gray-200 rounded-lg overflow-hidden">
                  <video src={`/api/videos/${reel.videoId}`} className="w-full h-full object-cover" muted />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Button onClick={() => handleDeleteReel(reel._id!)} variant="destructive" size="sm">
                    <Trash2 size={16} />
                  </Button>
                </div>
                <div className="mt-2">
                  <p className="font-medium text-sm truncate">{reel.title}</p>
                  <p className="text-xs text-gray-500">{reel.category}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                    <span>{reel.likes.length} likes</span>
                    <span>{reel.comments.length} comments</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
