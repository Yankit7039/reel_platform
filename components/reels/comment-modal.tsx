"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, MessageCircle, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import type { Reel, Comment } from "@/lib/types"
import { useAuth } from "@/components/providers/auth-provider"
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
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !user) return

    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/reels/${reel._id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    if (!editText.trim() || !user) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/reels/${reel._id}/comment/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: editText.trim() }),
      })

      if (response.ok) {
        const updatedComments = reel.comments.map(comment => 
          comment._id === commentId 
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
    if (!user) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/reels/${reel._id}/comment/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        reel.comments = reel.comments.filter(comment => comment._id !== commentId)
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
                <p className="text-center">No comments yet. Be the first to comment!</p>
              </motion.div>
            ) : (
              reel.comments.map((comment, index) => (
                <motion.div
                  key={comment._id}
                  variants={commentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ delay: index * 0.1 }}
                  className="flex space-x-3 px-4"
                >
                  <Avatar className="w-8 h-8 ring-2 ring-blue-500/20">
                    <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {comment.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="bg-gray-800/50 backdrop-blur rounded-2xl px-4 py-3 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm text-white">{comment.username}</p>
                          {user && comment.userId === user._id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 bg-gray-800 border-gray-700">
                                <DropdownMenuItem
                                  className="text-blue-400 focus:text-blue-400 focus:bg-blue-400/10"
                                  onClick={() => {
                                    setEditingCommentId(comment._id!)
                                    setEditText(comment.text)
                                  }}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-400 focus:text-red-400 focus:bg-red-400/10"
                                  onClick={() => handleDeleteComment(comment._id!)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        {editingCommentId === comment._id ? (
                          <div className="mt-2 space-y-2">
                            <Input
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="bg-gray-700/50 border-gray-600 text-white"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEditComment(comment._id!)}
                                className="bg-blue-500 hover:bg-blue-600"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
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
                          <p className="text-sm text-gray-300 mt-1">{comment.text}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 ml-2">
                      {new Date(comment.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit} className="flex space-x-2 pt-4 px-4 border-t border-gray-800">
          <div className="relative flex-1">
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 pr-12"
              disabled={loading}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-1 top-1 bg-blue-500 hover:bg-blue-600 transition-colors"
              disabled={loading || !comment.trim()}
            >
              <Send className="w-4 h-4" />
              <span className="sr-only">Send comment</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
