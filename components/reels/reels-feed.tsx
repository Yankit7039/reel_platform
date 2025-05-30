"use client"

import { useState, useEffect, useRef } from "react"
import type { Reel } from "@/lib/types"
import VideoPlayer from "./video-player"
import CommentModal from "./comment-modal"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

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
  const { data: session } = useSession()

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
    if (!session?.user?.id) {
      toast.error("Please sign in to like reels")
      return
    }

    try {
      const response = await fetch(`/api/reels/${reelId}/like`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setReels((prev) =>
          prev.map((reel) =>
            reel.id === reelId
              ? {
                  ...reel,
                  likes: data.isLiked ? [...reel.likes, session.user.id] : reel.likes.filter((id) => id !== session.user.id),
                  dislikes: reel.dislikes.filter((id) => id !== session.user.id),
                } as Reel
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
    if (!session?.user?.id) {
      toast.error("Please sign in to dislike reels")
      return
    }

    try {
      const response = await fetch(`/api/reels/${reelId}/dislike`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setReels((prev) =>
          prev.map((reel) =>
            reel.id === reelId
              ? {
                  ...reel,
                  dislikes: data.isDisliked
                    ? [...reel.dislikes, session.user.id]
                    : reel.dislikes.filter((id) => id !== session.user.id),
                  likes: reel.likes.filter((id) => id !== session.user.id),
                } as Reel
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
    if (!session?.user) {
      toast.error("Please sign in to comment")
      return
    }
    setSelectedReel(reel)
    setCommentModalOpen(true)
  }

  const handleCommentAdded = (newComment: any) => {
    setReels((prev) =>
      prev.map((reel) =>
        reel.id === selectedReel?.id
          ? {
              ...reel,
              comments: [...reel.comments, newComment],
            }
          : reel,
      ),
    )
    toast.success("Comment added successfully")
  }

  const handleCommentUpdated = (commentId: string, newText: string) => {
    setReels((prev) =>
      prev.map((reel) =>
        reel.id === selectedReel?.id
          ? {
              ...reel,
              comments: reel.comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, text: newText }
                  : comment
              ),
            }
          : reel
      )
    )
  }

  const handleCommentDeleted = (commentId: string) => {
    setReels((prev) =>
      prev.map((reel) =>
        reel.id === selectedReel?.id
          ? {
              ...reel,
              comments: reel.comments.filter((comment) => comment.id !== commentId),
            }
          : reel
      )
    )
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
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (reels.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-200 mb-2">No reels found</h2>
        <p className="text-gray-400">
          {category === "all"
            ? "Be the first to upload a reel!"
            : `No reels found in the ${category} category.`}
        </p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-auto snap-y snap-mandatory"
      onScroll={handleScroll}
    >
      {reels.map((reel, index) => (
        <div
          key={reel.id}
          className="h-screen snap-start relative flex items-center justify-center bg-black"
        >
          <VideoPlayer
            reel={reel}
            isActive={index === currentIndex}
            onLike={() => handleLike(reel.id!)}
            onDislike={() => handleDislike(reel.id!)}
            onComment={() => handleComment(reel)}
            onShare={() => handleShare(reel.id!)}
            isLiked={session?.user ? reel.likes.includes(session.user.id) : false}
            isDisliked={session?.user ? reel.dislikes.includes(session.user.id) : false}
          />
        </div>
      ))}

      {selectedReel && (
        <CommentModal
          isOpen={commentModalOpen}
          onClose={() => {
            setCommentModalOpen(false)
            setSelectedReel(null)
          }}
          reel={selectedReel}
          onCommentAdded={handleCommentAdded}
          onCommentUpdated={handleCommentUpdated}
          onCommentDeleted={handleCommentDeleted}
        />
      )}
    </div>
  )
}
