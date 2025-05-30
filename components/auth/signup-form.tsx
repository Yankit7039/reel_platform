"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function SignupForm() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store token and update auth context
        localStorage.setItem("token", data.token)
        toast.success("Account created successfully!")
        
        // Force a hard navigation to ensure proper state reset
        window.location.href = "/"
      } else {
        toast.error(data.error || "Failed to create account")
      }
    } catch (err) {
      console.error("Signup error:", err)
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
        />
        <p className="text-xs text-gray-400">Only letters, numbers, and underscores allowed</p>
      </div>
      <div>
        <Input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required
          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
        />
      </div>
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
        />
        <p className="text-xs text-gray-400">Must be at least 6 characters long</p>
      </div>
      <Button 
        type="submit" 
        disabled={loading} 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {loading ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  )
}
