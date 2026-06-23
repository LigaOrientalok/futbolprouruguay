"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

export interface AuthUser {
  id: string
  email: string
  username: string
  full_name: string
  avatar_url: string | null
  role: string
  subscription_tier: string
  is_suspended: boolean
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  register: (data: RegisterData) => Promise<{ error?: string }>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
  username: string
  role: "player" | "captain"
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/auth/me")
        if (cancelled) return
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const pathname = usePathname()
  const publicPaths = ["/", "/auth/login", "/auth/register", "/auth/error"]
  const isPublic = publicPaths.some((p) => pathname.startsWith(p))

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      router.push("/auth/login")
    }
  }, [loading, user, isPublic, router])

  const refresh = async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch {
      // ignore
    }
  }

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error || "Error al iniciar sesión" }
    await refresh()
    router.push("/dashboard")
    router.refresh()
    return {}
  }

  const register = async (data: RegisterData) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const result = await res.json()
    if (!res.ok) return { error: result.error || "Error al registrarse" }
    await refresh()
    router.push("/dashboard")
    router.refresh()
    return {}
  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    router.push("/")
    router.refresh()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider")
  }
  return context
}
