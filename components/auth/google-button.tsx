"use client"

import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function GoogleButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const result = await signIn("google", {
        callbackUrl: "/",
        redirect: true,
      })
    } catch (error) {
      console.error("Google login error:", error)
      toast.error("An error occurred while signing in with Google")
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full bg-white hover:bg-gray-50 text-gray-900 border-gray-300"
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-gray-600/30 border-t-gray-600 rounded-full animate-spin" />
          Connecting...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Image
            src="/google.svg"
            alt="Google"
            width={18}
            height={18}
            className="flex-shrink-0"
          />
          Continue with Google
        </div>
      )}
    </Button>
  )
} 