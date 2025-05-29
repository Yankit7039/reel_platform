"use client"

import { useAuth } from "@/components/providers/auth-provider"
import ReelsFeed from "@/components/reels/reels-feed"
import { CATEGORIES } from "@/lib/types"
import { useState } from "react"
import { useRouter } from "next/navigation"
import BottomNav from "@/components/navigation/bottom-nav"

export default function Home() {
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
    <main className="min-h-screen bg-black pb-16">
      {/* Category Filter */}
      <div className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-sm z-40 px-4 py-3 border-b border-gray-800">
        <div className="flex space-x-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedCategory === "all" ? "bg-blue-600 text-white" : "bg-white/10 text-white/70"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === category ? "bg-blue-600 text-white" : "bg-white/10 text-white/70"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Reels Feed */}
      <div className="mt-16">
        <ReelsFeed category={selectedCategory} />
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </main>
  )
}
