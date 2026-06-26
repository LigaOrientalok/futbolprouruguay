import { NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth-server"
import { validateOrigin } from "@/lib/csrf"

export async function POST(req: Request) {
  const csrf = validateOrigin(req)
  if (csrf) return csrf
  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  })
  return response
}
