export interface User {
  _id?: string
  username: string
  email: string
  password: string
  avatar?: string
  bio?: string
  createdAt: Date
}

export interface Reel {
  _id?: string
  userId: string
  username: string
  title: string
  description: string
  category: string
  videoId: string
  thumbnail?: string
  likes: string[]
  dislikes: string[]
  comments: Comment[]
  createdAt: Date
}

export interface Comment {
  _id?: string
  userId: string
  username: string
  text: string
  createdAt: Date
}

export const CATEGORIES = ["Comedy", "Dance", "Travel", "Food", "Fitness", "Fashion"] as const

export type Category = (typeof CATEGORIES)[number]
