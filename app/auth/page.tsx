import { Metadata } from "next"
import AuthContent from "@/components/auth/auth-content"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Sign In - ReelNest",
  description: "Sign in to your ReelNest account or create a new one.",
}

export default async function AuthPage() {
  const session = await getServerSession()

  if (session) {
    redirect("/")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-4">
      <AuthContent />
    </main>
  )
}
