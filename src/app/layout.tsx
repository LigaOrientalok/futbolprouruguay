import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/lib/auth-client"
import { QueryProvider } from "@/lib/query-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "FutbolMatch Uruguay",
    template: "%s | FutbolMatch Uruguay",
  },
  description: "La red social de fútbol amateur en Uruguay. Encontrá jugadores, equipos y organizá partidos.",
  keywords: ["fútbol", "uruguay", "amateurs", "jugadores", "equipos", "futbolmatch"],
  openGraph: {
    title: "FutbolMatch Uruguay",
    description: "La red social de fútbol amateur en Uruguay",
    type: "website",
    locale: "es_UY",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
