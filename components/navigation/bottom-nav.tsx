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
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t h-16 px-4 md:hidden">
      <div className="flex items-center justify-around h-full max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full",
              "transition-colors duration-200",
              item.active
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <item.icon size={24} />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
