"use client"

import { useAuth } from "@/components/providers/auth-provider"
import BottomNav from "@/components/navigation/bottom-nav"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import type { Reel } from "@/lib/types"
import { CATEGORIES } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { LogOut, Trash2, User, Mail, Grid, Film, Calendar, Edit } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()
  const [userReels, setUserReels] = useState<Reel[]>([])
  const [loadingReels, setLoadingReels] = useState(true)
  const [selectedReel, setSelectedReel] = useState<string | null>(null)
  const [editingReel, setEditingReel] = useState<Reel | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
      return
    }
    if (user?._id) {
      fetchUserReels()
    }
  }, [loading, user, router])

  const fetchUserReels = async () => {
    if (!user?._id) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/reels?userId=${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setUserReels(data)
    } catch (error) {
      console.error("Failed to fetch user reels:", error)
      toast({
        title: "Error",
        description: "Failed to fetch your reels. Please try again.",
        variant: "destructive",
      })
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setUserReels((prev) => prev.filter((reel) => reel._id !== reelId))
      toast({
        title: "Success",
        description: "Reel deleted successfully.",
      })
    } catch (error) {
      console.error("Failed to delete reel:", error)
      toast({
        title: "Error",
        description: "Failed to delete reel. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditReel = async (reelId: string, updatedData: Partial<Reel>) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/reels/${reelId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedReel = await response.json()
      setUserReels(prev => prev.map(reel => 
        reel._id === reelId ? { ...reel, ...updatedReel } : reel
      ))
      setEditingReel(null)
      toast({
        title: "Success",
        description: "Reel updated successfully.",
      })
    } catch (error) {
      console.error("Failed to update reel:", error)
      toast({
        title: "Error",
        description: "Failed to update reel. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    logout()
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 }
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black pb-20">
      <motion.div 
        className="container max-w-4xl mx-auto px-4 py-8 space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Profile Header */}
        <motion.div 
          className="relative bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl p-8 overflow-hidden backdrop-blur-xl border border-white/10"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-3xl"></div>
          <div className="relative z-10">
            <motion.div 
              className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </motion.div>

            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-white">{user.username}</h1>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Film className="w-4 h-4" />
                  <span>{userReels.length} Reels</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <Button 
                variant="outline"
                className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                onClick={() => router.push("/settings")}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button 
                variant="destructive"
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </motion.div>

        {/* User's Reels */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Grid className="w-5 h-5" />
              Your Reels
            </h2>
          </div>

          {loadingReels ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : userReels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {userReels.map((reel, index) => (
                  <motion.div
                    key={reel._id}
                    className="group relative aspect-[9/16] bg-gray-800/50 rounded-xl overflow-hidden backdrop-blur-sm border border-white/10"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <video 
                      src={`/api/videos/${reel.videoId}`}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      onClick={() => reel._id && setSelectedReel(reel._id)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                        <h3 className="text-white font-semibold truncate">{reel.title}</h3>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/10 border-white/20 hover:bg-white/20"
                            onClick={() => setEditingReel(reel)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-red-500/20 hover:bg-red-500/30"
                            onClick={() => reel._id && handleDeleteReel(reel._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">You haven't uploaded any reels yet.</p>
              <Button
                className="mt-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push("/upload")}
              >
                Upload Your First Reel
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>

      <BottomNav />

      {/* Edit Reel Dialog */}
      <Dialog open={!!editingReel} onOpenChange={() => setEditingReel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Title"
                value={editingReel?.title || ""}
                onChange={(e) => setEditingReel(prev => prev ? { ...prev, title: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Description"
                value={editingReel?.description || ""}
                onChange={(e) => setEditingReel(prev => prev ? { ...prev, description: e.target.value } : null)}
              />
            </div>
            <div className="pt-4 flex justify-end gap-4">
              <Button variant="outline" onClick={() => setEditingReel(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => editingReel?._id && handleEditReel(editingReel._id, {
                  title: editingReel.title,
                  description: editingReel.description
                })}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
