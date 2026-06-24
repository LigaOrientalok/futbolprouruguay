import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { createSession, hashPassword } from "@/lib/auth-server"

const ALLOWED_ROLES = ["player", "captain"]

export async function POST(req: Request) {
  try {
    const { email, password, full_name, username, role } = await req.json()

    if (!email || !password || !full_name || !username || !role) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
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
    await createSession(user.id, user.role)
    return NextResponse.json({
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
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}
