"use client"

import { useState, useEffect, useRef } from "react"
import type { Reel } from "@/lib/types"
import VideoPlayer from "./video-player"
import CommentModal from "./comment-modal"
import { useAuth } from "@/components/providers/auth-provider"
import { toast } from "sonner"
import BottomNav from "@/components/navigation/bottom-nav"

interface ReelsFeedProps {
  category?: string
}

export default function ReelsFeed({ category = "all" }: ReelsFeedProps) {
  const [reels, setReels] = useState<Reel[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchReels()
  }, [category])

  const fetchReels = async () => {
    try {
      const response = await fetch(`/api/reels?category=${category}`)
      if (response.ok) {
        const data = await response.json()
        setReels(data)
      }
    } catch (error) {
      console.error("Failed to fetch reels:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleScroll = () => {
    if (!containerRef.current) return

    const container = containerRef.current
    const scrollTop = container.scrollTop
    const itemHeight = container.clientHeight
    const newIndex = Math.round(scrollTop / itemHeight)

    if (newIndex !== currentIndex && newIndex < reels.length) {
      setCurrentIndex(newIndex)
    }
  }

  const handleLike = async (reelId: string) => {
    if (!user) {
      toast.error("Please sign in to like reels")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/reels/${reelId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setReels((prev) =>
          prev.map((reel) =>
            reel._id === reelId
              ? {
                  ...reel,
                  likes: data.isLiked ? [...reel.likes, user._id!] : reel.likes.filter((id) => id !== user._id),
                  dislikes: reel.dislikes.filter((id) => id !== user._id),
                }
              : reel,
          ),
        )
      }
    } catch (error) {
      console.error("Failed to like reel:", error)
      toast.error("Failed to like reel")
    }
  }

  const handleDislike = async (reelId: string) => {
    if (!user) {
      toast.error("Please sign in to dislike reels")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/reels/${reelId}/dislike`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setReels((prev) =>
          prev.map((reel) =>
            reel._id === reelId
              ? {
                  ...reel,
                  dislikes: data.isDisliked
                    ? [...reel.dislikes, user._id!]
                    : reel.dislikes.filter((id) => id !== user._id),
                  likes: reel.likes.filter((id) => id !== user._id),
                }
              : reel,
          ),
        )
      }
    } catch (error) {
      console.error("Failed to dislike reel:", error)
      toast.error("Failed to dislike reel")
    }
  }

  const handleComment = (reel: Reel) => {
    if (!user) {
      toast.error("Please sign in to comment")
      return
    }
    setSelectedReel(reel)
    setCommentModalOpen(true)
  }

  const handleCommentAdded = (newComment: any) => {
    setReels((prev) =>
      prev.map((reel) =>
        reel._id === selectedReel?._id
          ? {
              ...reel,
              comments: [...reel.comments, newComment],
            }
          : reel,
      ),
    )
    toast.success("Comment added successfully")
  }

  const handleShare = async (reelId: string) => {
    const shareUrl = `${window.location.origin}/reel/${reelId}`
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Check out this reel!",
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast.success("Link copied to clipboard!")
      }
    } catch (error) {
      console.error("Share failed:", error)
      // If share fails, fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success("Link copied to clipboard!")
      } catch (clipboardError) {
        toast.error("Failed to share reel")
      }
    }
  }

  if (loading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (reels.length === 0) {
    return (
      <div className="h-[100dvh] flex items-center justify-center">
        <p className="text-gray-500 text-lg">No reels found</p>
      </div>
    )
  }

  return (
    <>
      <div
        ref={containerRef}
        className="h-[100dvh] overflow-y-scroll snap-y snap-mandatory no-scrollbar pb-16"
        onScroll={handleScroll}
      >
        {reels.map((reel, index) => (
          <div key={reel._id} className="h-[100dvh] snap-start">
            <VideoPlayer
              reel={reel}
              isActive={index === currentIndex}
              onLike={() => handleLike(reel._id!)}
              onDislike={() => handleDislike(reel._id!)}
              onComment={() => handleComment(reel)}
              onShare={() => handleShare(reel._id!)}
            />
          </div>
        ))}
      </div>
      {selectedReel && (
        <CommentModal
          reel={selectedReel}
          isOpen={commentModalOpen}
          onClose={() => {
            setCommentModalOpen(false)
            setSelectedReel(null)
          }}
          onCommentAdded={handleCommentAdded}
        />
      )}
      <BottomNav />
    </>
  )
}
