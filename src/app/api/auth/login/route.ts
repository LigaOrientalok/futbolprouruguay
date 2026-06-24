import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { createSessionToken, verifyPassword, COOKIE_NAME } from "@/lib/auth-server"

interface UserRow {
  id: string
  email: string
  username: string
  full_name: string
  avatar_url: string | null
  role: string
  subscription_tier: string
  is_suspended: boolean
  password_hash: string
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 })
    }

    const users = await query<UserRow>("SELECT * FROM users WHERE email = $1", [email])
    const user = users[0]

    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    if (!user.password_hash) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    if (user.is_suspended) {
      return NextResponse.json({ error: "Cuenta suspendida" }, { status: 403 })
    }

    const token = await createSessionToken(user.id, user.role)
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        role: user.role,
        subscription_tier: user.subscription_tier,
        is_suspended: user.is_suspended,
      },
    })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}
