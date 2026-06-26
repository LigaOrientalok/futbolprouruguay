import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { compare, hash } from "bcryptjs"
import { query } from "./db"
import type { NextResponse } from "next/server"

if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET no configurado en el entorno")
}
const secret = new TextEncoder().encode(process.env.AUTH_SECRET)

export const COOKIE_NAME = "session"

export async function createSession(userId: string, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  })
}

export async function createSessionToken(userId: string, role: string) {
  return await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret)
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  })
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
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

import type { UserRole, SubscriptionTier } from "./types"

export interface UserRow {
  id: string
  email: string
  username: string
  full_name: string
  avatar_url: string | null
  role: UserRole
  subscription_tier: SubscriptionTier
  is_suspended: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

export async function getCurrentUser(): Promise<UserRow | null> {
  const session = await getSession()
  if (!session) return null
  
  const users = await query<UserRow>("SELECT * FROM users WHERE id = $1", [session.userId])
  return users[0] || null
}
