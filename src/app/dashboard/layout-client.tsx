"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { useTheme } from "next-themes"
import { Trophy, Sun, Moon, Menu, LogOut } from "lucide-react"
import { getInitials } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const handleLogout = async () => {
    await logout()
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between h-14 px-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2">
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">FutbolMatch</span>
          </Link>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-background border-r p-4 animate-in slide-in-from-left">
            <div className="flex items-center justify-between mb-6">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="font-bold">FutbolMatch</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <SidebarNav onItemClick={() => setSidebarOpen(false)} />
            <div className="mt-6 pt-6 border-t">
              <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors">
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 border-r bg-card">
          <div className="flex items-center gap-2 h-14 px-6 border-b">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="font-bold">FutbolMatch</span>
          </div>
          <div className="flex-1 flex flex-col justify-between p-4">
            <SidebarNav />
            <div className="pt-4 border-t">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url || undefined} />
                  <AvatarFallback>{user ? getInitials(user.full_name) : "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">@{user?.username}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors">
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64 pt-14 lg:pt-0">
        <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
