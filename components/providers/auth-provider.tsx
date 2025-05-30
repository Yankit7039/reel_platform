"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

const AuthContext = createContext<{
  user: User | null
  loading: boolean
}>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  )
}

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status !== "loading") {
      setLoading(false)
    }
  }, [status])

  // Handle auth redirects
  useEffect(() => {
    if (!loading) {
      if (session?.user && pathname === "/auth") {
        router.push("/")
      } else if (!session?.user && pathname !== "/auth" && !pathname.startsWith("/api/")) {
        router.push("/auth")
      }
    }
  }, [loading, session, pathname, router])

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
