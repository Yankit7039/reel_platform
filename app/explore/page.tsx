"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { CATEGORIES } from "@/lib/types"
import { useRouter } from "next/navigation"
import ReelsFeed from "@/components/reels/reels-feed"
import { useState } from "react"

export default function ExplorePage() {
  const { user, loading } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState("Comedy")
  const router = useRouter()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    router.push("/auth")
    return null
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm z-40 p-4">
        <h1 className="text-xl font-bold text-center mb-4">Explore</h1>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`p-3 rounded-lg text-sm font-medium ${
                selectedCategory === category ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Reels Feed */}
      <div className="pt-32 pb-20">
        <ReelsFeed category={selectedCategory} />
      </div>
    </div>
  )
}
