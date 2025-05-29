"use client"

import { useState } from "react"
import LoginForm from "@/components/auth/login-form"
import SignupForm from "@/components/auth/signup-form"
import { Button } from "@/components/ui/button"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">{isLogin ? "Welcome Back" : "Create Account"}</h1>

        {isLogin ? <LoginForm /> : <SignupForm />}

        <div className="mt-6 text-center">
          <p className="text-gray-600">{isLogin ? "Don't have an account?" : "Already have an account?"}</p>
          <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="mt-2">
            {isLogin ? "Sign up" : "Log in"}
          </Button>
        </div>
      </div>
    </div>
  )
}
