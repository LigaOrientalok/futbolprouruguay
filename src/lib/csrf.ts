import { NextResponse } from "next/server"

export function validateOrigin(req: Request): NextResponse | null {
  const origin = req.headers.get("origin")
  const referer = req.headers.get("referer")
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    "http://localhost:3000",
    "http://localhost:3001",
  ].filter(Boolean) as string[]

  const source = origin || referer || ""
  if (!source) return null

  const isAllowed = allowedOrigins.some((allowed) => source.startsWith(allowed))
  if (!isAllowed) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 })
  }
  return null
}
