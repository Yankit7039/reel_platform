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

      if (response.ok) {
        setUserReels((prev) => prev.filter((reel) => reel._id !== reelId))
        toast({
          title: "Success",
          description: "Reel deleted successfully.",
        })
      }
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

      if (response.ok) {
        const updatedReel = await response.json()
        setUserReels(prev => prev.map(reel => 
          reel._id === reelId ? { ...reel, ...updatedReel } : reel
        ))
        setEditingReel(null)
        toast({
          title: "Success",
          description: "Reel updated successfully.",
        })
      }
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
    router.push("/auth")
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
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
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
                      poster={reel.thumbnail || ''}
                      playsInline
                      onClick={() => {
                        if (reel._id) {
                          setSelectedReel(selectedReel === reel._id ? null : reel._id)
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white text-lg font-medium line-clamp-1">{reel.title}</h3>
                        <p className="text-gray-300 text-sm line-clamp-2 mt-1">{reel.description}</p>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-sm text-gray-400">
                            {new Date(reel.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingReel(reel)
                              }}
                              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteReel(reel._id!)
                              }}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {selectedReel === reel._id && (
                      <video 
                        src={`/api/videos/${reel.videoId}`}
                        className="absolute inset-0 w-full h-full object-cover z-10"
                        autoPlay
                        controls
                        playsInline
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div 
              className="text-center py-16 bg-gray-800/20 rounded-2xl border border-gray-700/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Film className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400 text-lg mb-4">No reels uploaded yet</p>
              <Button 
                onClick={() => router.push("/upload")}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Upload Your First Reel
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      
      {/* Edit Reel Dialog */}
      <Dialog open={!!editingReel} onOpenChange={() => setEditingReel(null)}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-lg border border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Reel</DialogTitle>
          </DialogHeader>
          {editingReel && (
            <form onSubmit={(e) => {
              e.preventDefault()
              handleEditReel(editingReel._id!, {
                title: editingReel.title,
                description: editingReel.description,
                category: editingReel.category
              })
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
                <Input
                  value={editingReel.title}
                  onChange={(e) => setEditingReel({ ...editingReel, title: e.target.value })}
                  className="bg-gray-800/50 border-gray-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                <Textarea
                  value={editingReel.description}
                  onChange={(e) => setEditingReel({ ...editingReel, description: e.target.value })}
                  className="bg-gray-800/50 border-gray-700 text-white min-h-[100px]"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
                <select
                  value={editingReel.category}
                  onChange={(e) => setEditingReel({ ...editingReel, category: e.target.value })}
                  className="w-full p-2.5 bg-gray-800/50 border border-gray-700 rounded-md text-white"
                  required
                >
                  {CATEGORIES.map((category: string) => (
                    <option key={category} value={category} className="bg-gray-800">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingReel(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </main>
  )
}
