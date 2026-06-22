import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-change-in-production"
)
const COOKIE_NAME = "session"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get(COOKIE_NAME)?.value

  const publicPaths = ["/", "/auth/login", "/auth/register", "/auth/error", "/api/auth/login", "/api/auth/register", "/api/auth/me"]
  const isPublic = publicPaths.some((p) => pathname.startsWith(p))
  const isStaticAsset = pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.includes(".")

  if (isStaticAsset) return NextResponse.next()

  let isAuthenticated = false
  if (sessionCookie) {
    try {
      await jwtVerify(sessionCookie, secret)
      isAuthenticated = true
    } catch {
      isAuthenticated = false
    }
  }

  if (!isAuthenticated && !isPublic) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (isAuthenticated && isPublic && pathname !== "/auth/error") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
