"use client"

import { useAuth } from "@/components/providers/auth-provider"
import UploadForm from "@/components/upload/upload-form"
import { useRouter } from "next/navigation"

export default function UploadPage() {
  const { user, loading } = useAuth()
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
    <div className="min-h-screen bg-gray-50 py-8">
      <UploadForm />
    </div>
  )
}
