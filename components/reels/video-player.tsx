"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, Share, ThumbsDown } from "lucide-react"
import type { Reel } from "@/lib/types"
import { useSession } from "next-auth/react"

interface VideoPlayerProps {
  reel: Reel
  isActive: boolean
  onLike: () => void
  onDislike: () => void
  onComment: () => void
  onShare: () => void
  isLiked: boolean
  isDisliked: boolean
}

export default function VideoPlayer({ 
  reel, 
  isActive, 
  onLike, 
  onDislike, 
  onComment, 
  onShare,
  isLiked,
  isDisliked 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [swipeDirection, setSwipeDirection] = useState<"like" | "dislike" | null>(null)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showActionFeedback, setShowActionFeedback] = useState<"like" | "dislike" | "comment" | "share" | null>(null)

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(console.error)
      } else {
        videoRef.current.pause()
      }
    }
  }, [isActive])

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return

    const currentX = e.touches[0].clientX
    setCurrentX(currentX)

    const diff = currentX - startX
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setSwipeDirection("like")
      } else {
        setSwipeDirection("dislike")
      }
    } else {
      setSwipeDirection(null)
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging) return

    const diff = currentX - startX
    if (Math.abs(diff) > 100) {
      if (diff > 0) {
        handleLike()
      } else {
        handleDislike()
      }
    }

    setIsDragging(false)
    setSwipeDirection(null)
    setStartX(0)
    setCurrentX(0)
  }

  const handleLike = () => {
    onLike()
    showFeedback("like")
  }

  const handleDislike = () => {
    onDislike()
    showFeedback("dislike")
  }

  const handleComment = () => {
    onComment()
    showFeedback("comment")
  }

  const handleShare = () => {
    onShare()
    showFeedback("share")
  }

  const showFeedback = (action: "like" | "dislike" | "comment" | "share") => {
    setShowActionFeedback(action)
    setTimeout(() => setShowActionFeedback(null), 1000)
  }

  return (
    <div
      className="relative h-full w-full bg-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Video Container with proper aspect ratio */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain"
            src={`/api/videos/${reel.videoId}`}
            loop
            muted
            playsInline
            onClick={() => {
              if (videoRef.current?.paused) {
                videoRef.current.play()
              } else {
                videoRef.current?.pause()
              }
            }}
          />
        </div>
      </div>

      {/* Action Feedback */}
      <AnimatePresence>
        {showActionFeedback && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            {showActionFeedback === "like" && <Heart className="text-red-500" size={80} />}
            {showActionFeedback === "dislike" && <ThumbsDown className="text-gray-500" size={80} />}
            {showActionFeedback === "comment" && <MessageCircle className="text-blue-500" size={80} />}
            {showActionFeedback === "share" && <Share className="text-green-500" size={80} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe Indicators */}
      <AnimatePresence>
        {swipeDirection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            {swipeDirection === "like" && <Heart className="text-red-500" size={80} />}
            {swipeDirection === "dislike" && <ThumbsDown className="text-gray-500" size={80} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Info and Actions */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="bg-gradient-to-t from-black/60 via-black/40 to-transparent pt-24 pb-6 px-4">
          <div className="relative max-w-md mx-auto flex items-end justify-between">
            {/* Video Info */}
            <div className="flex-1 pr-4">
              <h3 className="text-white font-semibold text-lg md:text-xl">{reel.title}</h3>
              <p className="text-white/80 text-sm">@{reel.username}</p>
              <p className="text-white/70 text-sm mt-1 line-clamp-2">{reel.description}</p>
              <span className="inline-block bg-white/20 text-white text-xs px-2 py-1 rounded-full mt-2">
                {reel.category}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-4">
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={handleLike}
                className={`p-3 rounded-full ${isLiked ? "bg-red-500" : "bg-white/20"}`}
              >
                <Heart className={`${isLiked ? "text-white fill-current" : "text-white"}`} size={24} />
                <span className="text-white text-xs block mt-1">{reel.likes.length}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={handleDislike}
                className={`p-3 rounded-full ${isDisliked ? "bg-gray-500" : "bg-white/20"}`}
              >
                <ThumbsDown className={`${isDisliked ? "text-white fill-current" : "text-white"}`} size={24} />
                <span className="text-white text-xs block mt-1">{reel.dislikes.length}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={handleComment}
                className="p-3 rounded-full bg-white/20"
              >
                <MessageCircle className="text-white" size={24} />
                <span className="text-white text-xs block mt-1">{reel.comments.length}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={handleShare}
                className="p-3 rounded-full bg-white/20"
              >
                <Share className="text-white" size={24} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
