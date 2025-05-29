"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home, Compass, Upload, User } from "lucide-react"
import { cn } from "@/lib/utils"

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    {
      label: "Home",
      icon: Home,
      href: "/",
      active: pathname === "/"
    },
    {
      label: "Explore",
      icon: Compass,
      href: "/explore",
      active: pathname === "/explore"
    },
    {
      label: "Upload",
      icon: Upload,
      href: "/upload",
      active: pathname === "/upload"
    },
    {
      label: "Profile",
      icon: User,
      href: "/profile",
      active: pathname === "/profile"
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 h-16 z-[100]">
      <div className="flex items-center justify-between h-full px-6 max-w-lg mx-auto">
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-16",
              item.active
                ? "text-blue-500"
                : "text-gray-400 hover:text-white"
            )}
          >
            <item.icon size={20} />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
