"use client"

import { useAuth } from "@/components/providers/auth-provider"
import UploadForm from "@/components/upload/upload-form"
import BottomNav from "@/components/navigation/bottom-nav"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Upload } from "lucide-react"

export default function UploadPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    router.push("/auth")
    return null
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <motion.div 
        className="container max-w-lg mx-auto px-4 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-8 border border-gray-700/50 shadow-xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
            whileHover={{ scale: 1.05, rotate: 360 }}
            transition={{ duration: 0.8 }}
          >
            <Upload size={32} className="text-white" />
          </motion.div>
          <motion.h1 
            className="text-2xl font-bold text-white text-center mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Upload Reel
          </motion.h1>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <UploadForm />
          </motion.div>
        </motion.div>
      </motion.div>
      <BottomNav />
    </main>
  )
}
