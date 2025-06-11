"use client"

import { useState } from "react"
import LoginForm from "@/components/auth/login-form"
import SignupForm from "@/components/auth/signup-form"
import { motion, AnimatePresence } from "framer-motion"
import { Film } from "lucide-react"

export default function AuthContent() {
  const [isLogin, setIsLogin] = useState(true)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <motion.div 
      className="w-full max-w-md"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Logo and Title */}
      <motion.div 
        className="text-center mb-8"
        variants={itemVariants}
      >
        <div className="inline-block p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-white/10 mb-4">
          <Film className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          ReelNest
        </h1>
        <p className="text-gray-400 mt-2">Share your moments with the world</p>
      </motion.div>

      {/* Auth Forms Container */}
      <motion.div 
        className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-6 backdrop-blur-xl border border-white/10"
        variants={itemVariants}
      >
        {/* Tab Buttons */}
        <div className="flex mb-6 bg-gray-800/50 rounded-lg p-1">
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              isLogin
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              !isLogin
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        {/* Forms */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? "login" : "signup"}
            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            {isLogin ? <LoginForm /> : <SignupForm />}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <motion.p 
        className="text-center mt-6 text-sm text-gray-500"
        variants={itemVariants}
      >
        By continuing, you agree to our Terms of Service and Privacy Policy
      </motion.p>
    </motion.div>
  )
} 