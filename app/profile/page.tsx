"use client"

import { useAuth } from "@/components/providers/auth-provider"
import BottomNav from "@/components/navigation/bottom-nav"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import type { Reel } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { LogOut, Trash2, User, Mail } from "lucide-react"
import { motion } from "framer-motion"

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
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <motion.div 
        className="container max-w-lg mx-auto px-4 py-8 space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Profile Info */}
        <motion.div 
          className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-8 border border-gray-700/50 shadow-xl"
          variants={itemVariants}
        >
          <motion.div 
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-3xl font-bold text-white">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </motion.div>
          <h1 className="text-2xl font-bold text-white text-center mb-8">Profile</h1>
          <div className="space-y-6">
            <motion.div 
              className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <User className="text-blue-400" size={20} />
              <div>
                <label className="text-sm text-gray-400">Username</label>
                <p className="text-white font-medium">{user.username}</p>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <Mail className="text-blue-400" size={20} />
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <p className="text-white font-medium">{user.email}</p>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                variant="destructive" 
                className="w-full flex items-center justify-center gap-2 py-6 text-lg font-medium"
                onClick={handleLogout}
              >
                <LogOut size={20} />
                Logout
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* User's Reels */}
        <motion.div 
          className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-8 border border-gray-700/50 shadow-xl"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Your Reels</h2>
          {loadingReels ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : userReels.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {userReels.map((reel, index) => (
                <motion.div
                  key={reel._id}
                  className="relative group"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <video 
                    src={`/api/videos/${reel.videoId}`}
                    className="w-full h-48 object-cover rounded-lg shadow-lg"
                  />
                  {reel._id && (
                    <motion.button
                      onClick={() => handleDeleteReel(reel._id!)}
                      className="absolute top-2 right-2 p-3 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={16} className="text-white" />
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.p 
              className="text-gray-400 text-center py-12 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              No reels uploaded yet
            </motion.p>
          )}
        </motion.div>
      </motion.div>
      <BottomNav />
    </main>
  )
}
