import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { createSessionToken, hashPassword, COOKIE_NAME } from "@/lib/auth-server"
import { validateOrigin } from "@/lib/csrf"

const ALLOWED_ROLES = ["player", "captain"]

export async function POST(req: Request) {
  try {
    const csrf = validateOrigin(req)
    if (csrf) return csrf
    const { email, password, full_name, username, role } = await req.json()

    if (!email || !password || !full_name || !username || !role) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: "El usuario solo puede contener letras, números y guión bajo" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 })
    }

    const existingEmail = await query("SELECT id FROM users WHERE email = $1", [email])
    if (existingEmail.length > 0) {
      return NextResponse.json({ error: "Este email ya está registrado" }, { status: 409 })
    }

    const existingUser = await query("SELECT id FROM users WHERE username = $1", [username])
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Este nombre de usuario ya está en uso" }, { status: 409 })
    }

    const password_hash = await hashPassword(password)
    const id = crypto.randomUUID()

    const result = await query<{
      id: string; email: string; username: string; full_name: string;
      avatar_url: string | null; role: string; subscription_tier: string; is_suspended: boolean
    }>(
      `INSERT INTO users (id, email, username, full_name, role, password_hash, subscription_tier)
       VALUES ($1, $2, $3, $4, $5, $6, 'free') RETURNING *`,
      [id, email, username, full_name, role, password_hash]
    )

    const user = result[0]
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
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })
    return response
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}
