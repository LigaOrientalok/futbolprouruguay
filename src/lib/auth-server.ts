import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { compare, hash } from "bcryptjs"
import { query } from "./db"

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-change-in-production"
)

const COOKIE_NAME = "session"

export async function createSession(userId: string, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  })
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    return { userId: payload.userId as string, role: payload.role as string }
  } catch {
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await compare(password, hash)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  
  const users = await query<any>("SELECT * FROM users WHERE id = $1", [session.userId])
  return users[0] || null
}
