"use client"

import { useAuth } from "@/components/providers/auth-provider"
import ReelsFeed from "@/components/reels/reels-feed"
import BottomNav from "@/components/navigation/bottom-nav"
import { CATEGORIES } from "@/lib/types"
import { useState } from "react"
import { useRouter } from "next/navigation"

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
    <div className="relative">
      {/* Category Filter */}
      <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm z-40 p-4">
        <div className="flex space-x-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedCategory === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === category ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Reels Feed */}
      <div className="pt-20 pb-20">
        <ReelsFeed category={selectedCategory} />
      </div>

      <BottomNav />
    </div>
  )
}
