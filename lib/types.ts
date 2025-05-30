export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export interface DBUser {
  _id: string
  username: string
  email: string
  password: string
  avatar?: string
  bio?: string
  createdAt: Date
}

export interface Reel {
  id?: string
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
  id?: string
  userId: string
  username: string
  text: string
  createdAt: Date
}

export const CATEGORIES = [
  "Comedy",
  "Music",
  "Dance",
  "Food",
  "Travel",
  "Gaming",
  // "Education",
  // "Sports",
  // "Fashion",
  // "Beauty",
  // "Technology",
  // "Animals",
  // "Art",
  // "DIY",
  // "Fitness",
] as const

export type Category = (typeof CATEGORIES)[number]
