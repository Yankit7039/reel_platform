"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, MessageCircle, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import type { Reel, Comment } from "@/lib/types"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CommentModalProps {
  isOpen: boolean
  onClose: () => void
  reel: Reel
  onCommentAdded: (comment: Comment) => void
  onCommentUpdated?: (commentId: string, newText: string) => void
  onCommentDeleted?: (commentId: string) => void
}

export default function CommentModal({ 
  isOpen, 
  onClose, 
  reel, 
  onCommentAdded,
  onCommentUpdated = () => {},
  onCommentDeleted = () => {}
}: CommentModalProps) {
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const { data: session } = useSession()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !session?.user) return

    setLoading(true)
    try {
      const response = await fetch(`/api/reels/${reel.id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: comment.trim() }),
      })

      if (response.ok) {
        const newComment = await response.json()
        onCommentAdded(newComment)
        setComment("")
        toast({
          title: "Comment added!",
          description: "Your comment has been posted successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to post comment. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to post comment:", error)
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim() || !session?.user) return

    try {
      const response = await fetch(`/api/reels/${reel.id}/comment/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: editText.trim() }),
      })

      if (response.ok) {
        const updatedComments = reel.comments.map(comment => 
          comment.id === commentId 
            ? { ...comment, text: editText.trim() }
            : comment
        )
        reel.comments = updatedComments
        
        onCommentUpdated(commentId, editText.trim())
        setEditingCommentId(null)
        setEditText("")
        toast({
          title: "Comment updated!",
          description: "Your comment has been updated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update comment. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update comment:", error)
      toast({
        title: "Error",
        description: "Failed to update comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!session?.user) return

    try {
      const response = await fetch(`/api/reels/${reel.id}/comment/${commentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        reel.comments = reel.comments.filter(comment => comment.id !== commentId)
        onCommentDeleted(commentId)
        toast({
          title: "Comment deleted!",
          description: "Your comment has been deleted successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete comment. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to delete comment:", error)
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const commentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] flex flex-col bg-gray-900/95 backdrop-blur-lg border border-gray-800">
        <DialogHeader className="border-b border-gray-800 pb-4">
          <DialogTitle className="flex items-center gap-2 text-white">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            Comments ({reel.comments.length})
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 py-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <AnimatePresence>
            {reel.comments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-gray-400"
              >
                <MessageCircle className="w-12 h-12 mb-4 text-gray-500" />
                <p>No comments yet. Be the first to comment!</p>
              </motion.div>
            ) : (
              reel.comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  variants={commentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex gap-3 px-4"
                >
                  <Avatar className="w-8 h-8 border border-gray-700">
                    <AvatarFallback className="bg-gray-800 text-gray-400">
                      {comment.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-200">
                          {comment.username}
                        </p>
                        {editingCommentId === comment.id ? (
                          <div className="mt-1 space-y-2">
                            <Input
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="bg-gray-800/50 border-gray-700"
                              placeholder="Edit your comment..."
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEditComment(comment.id || "")}
                                disabled={!editText.trim()}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingCommentId(null)
                                  setEditText("")
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-300">{comment.text}</p>
                        )}
                      </div>
                      {session?.user?.id === comment.userId && !editingCommentId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 hover:bg-gray-800"
                            >
                              <MoreVertical className="h-4 w-4 text-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-32 bg-gray-900 border-gray-800"
                          >
                            <DropdownMenuItem
                              className="text-gray-300 focus:text-gray-200 focus:bg-gray-800"
                              onClick={() => {
                                setEditingCommentId(comment.id || null)
                                setEditText(comment.text)
                              }}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-400 focus:text-red-300 focus:bg-red-900/20"
                              onClick={() => handleDeleteComment(comment.id || "")}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit} className="border-t border-gray-800 pt-4">
          <div className="flex gap-2">
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-gray-800/50 border-gray-700"
              disabled={loading || !session?.user}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={loading || !comment.trim() || !session?.user}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          {!session?.user && (
            <p className="mt-2 text-sm text-gray-400">
              Please sign in to comment.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
