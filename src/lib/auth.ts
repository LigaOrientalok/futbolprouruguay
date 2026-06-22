import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import type { NextAuthConfig } from "next-auth"
import { query } from "./db"

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.username = (user as any).username
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
        ;(session.user as any).username = token.username
      }
      return session
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const publicPaths = ["/", "/auth/login", "/auth/register", "/auth/error"]
      const isPublic = publicPaths.some((p) => nextUrl.pathname.startsWith(p))

      if (!isLoggedIn && !isPublic) {
        return false
      }
      if (isLoggedIn && isPublic && nextUrl.pathname !== "/auth/error") {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }
      return true
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const users = await query<any>(
          "SELECT * FROM users WHERE email = $1",
          [credentials.email as string]
        )
        const user = users[0]

        if (!user) return null

        // Verificar contraseña (para seed, comparar directo)
        const isValid = user.password_hash
          ? await compare(credentials.password as string, user.password_hash)
          : false

        if (!isValid) return null

        if (user.is_suspended) return null

        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          role: user.role,
          username: user.username,
        }
      },
    }),
  ],
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
