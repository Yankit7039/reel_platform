"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { CATEGORIES } from "@/lib/types"
import { useRouter } from "next/navigation"
import ReelsFeed from "@/components/reels/reels-feed"
import { useState } from "react"
import BottomNav from "@/components/navigation/bottom-nav"

export default function ExplorePage() {
  const { user, loading } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState("all")
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
    <main className="min-h-screen bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-sm z-40 p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white text-center mb-4">Explore</h1>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`p-3 rounded-lg text-sm font-medium ${
              selectedCategory === "all" ? "bg-blue-600 text-white" : "bg-white/10 text-white/70"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`p-3 rounded-lg text-sm font-medium ${
                selectedCategory === category ? "bg-blue-600 text-white" : "bg-white/10 text-white/70"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Reels Feed */}
      <div className="pt-32 pb-16">
        <ReelsFeed category={selectedCategory} />
      </div>
      <BottomNav />
    </main>
  )
}
