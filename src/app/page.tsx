import Link from "next/link"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Trophy, Search, Users, Calendar, MessageCircle, Shield, Star, Loader2 } from "lucide-react"
import { ThemeToggle } from "@/components/landing/theme-toggle"
import { MobileNav } from "@/components/landing/mobile-nav"
import { AuthNav } from "@/components/landing/auth-nav"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" style={{ animation: "float 3s ease-in-out infinite" }} />
            <span className="text-xl font-bold">FutbolMatch Uruguay</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cómo funciona</Link>
            <Link href="#premium" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Premium</Link>
            <Suspense fallback={<Loader2 className="h-4 w-4 animate-spin" />}>
              <AuthNav />
            </Suspense>
            <ThemeToggle />
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <MobileNav />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(hsl(142 76% 36% / 0.06) 1px, transparent 1px),
              linear-gradient(90deg, hsl(142 76% 36% / 0.06) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Radial gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

        <div className="container mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6 animate-fade-in-up">
            <Star className="h-4 w-4" />
            <span>La comunidad #1 del fútbol amateur en Uruguay</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Encontrá tu equipo,{" "}
            <span className="text-primary">viví el fútbol</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Conectá con jugadores y equipos de tu zona. Creá tu perfil, encontrá partidos y llevá tu pasión al siguiente nivel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Button size="lg" asChild>
              <Link href="/auth/register">Comenzá gratis</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Conocé más</Link>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            {[
              { value: "500+", label: "Jugadores" },
              { value: "100+", label: "Equipos" },
              { value: "50+", label: "Partidos por mes" },
              { value: "95%", label: "Satisfacción" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="text-center p-4 rounded-xl bg-background/50 backdrop-blur border hover:-translate-y-1 hover:shadow-lg transition-all duration-300 animate-count-up"
                style={{ animationDelay: `${0.5 + i * 0.1}s` }}
              >
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in-up">Todo lo que necesitás</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: "Buscá jugadores", desc: "Encontrá el jugador ideal para tu equipo según posición, ubicación y disponibilidad." },
              { icon: Users, title: "Creá tu equipo", desc: "Administrá tu plantel, publicá necesidades y recibí postulaciones." },
              { icon: Calendar, title: "Organizá partidos", desc: "Desafiá a otros equipos y coordiná amistosos fácilmente." },
              { icon: MessageCircle, title: "Chat en vivo", desc: "Comunicate con jugadores y equipos en tiempo real." },
              { icon: Trophy, title: "Competí", desc: "Participá en torneos y ganá reconocimiento en la comunidad." },
              { icon: Shield, title: "Perfil destacado", desc: "Con Premium aparecé primero y obtené más oportunidades." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="flex flex-col items-center text-center p-6 rounded-xl border bg-card hover:-translate-y-1 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in-up">Cómo funciona</h2>
          <div className="relative max-w-4xl mx-auto">
            {/* Desktop step connector */}
            <div className="hidden md:block absolute top-6 left-[calc(16.666%+1.5rem)] right-[calc(16.666%+1.5rem)] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Creá tu cuenta", desc: "Registrate como jugador o capitán en menos de 2 minutos." },
                { step: "2", title: "Completá tu perfil", desc: "Agregá tu posición, ubicación, y disponibilidad." },
                { step: "3", title: "Conectá", desc: "Encontrá equipos, desafiá rivales y viví el fútbol." },
              ].map(({ step, title, desc }, i) => (
                <div key={step} className="text-center animate-fade-in-up" style={{ animationDelay: `${0.1 * i}s` }}>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4 relative z-10">
                    {step}
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Premium */}
      <section id="premium" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 animate-fade-in-up">FutbolMatch Premium</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Llevá tu experiencia al siguiente nivel con nuestro plan premium
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="rounded-xl border bg-card p-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-xl font-semibold mb-4">Gratuito</h3>
              <p className="text-3xl font-bold mb-4">$0</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-primary">✓</span> Perfil básico
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-primary">✓</span> 3 postulaciones por semana
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-primary">✓</span> Búsqueda de equipos
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-muted-foreground">✗</span> Perfil destacado
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-muted-foreground">✗</span> Postulaciones ilimitadas
                </li>
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth/register">Empezar gratis</Link>
              </Button>
            </div>
            <div className="rounded-xl border-2 border-primary bg-gradient-to-br from-card to-primary/[0.03] p-8 relative animate-fade-in-up animate-pulse-glow" style={{ animationDelay: "0.3s" }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                RECOMENDADO
              </div>
              <h3 className="text-xl font-semibold mb-4">Premium</h3>
              <p className="text-3xl font-bold mb-4">$9.99 <span className="text-sm text-muted-foreground font-normal">/mes</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-primary">✓</span> Todo lo del plan gratis
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-primary">✓</span> Perfil destacado con badge
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-primary">✓</span> Postulaciones ilimitadas
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-primary">✓</span> Aparición prioritaria en búsquedas
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-primary">✓</span> Estadísticas avanzadas
                </li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/auth/register">Empezar gratis</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 80%, hsl(142 76% 36% / 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, hsl(142 76% 36% / 0.03) 0%, transparent 50%)
            `,
          }}
        />
        <div className="container mx-auto text-center relative animate-fade-in-up">
          <h2 className="text-3xl font-bold mb-4">¿Listo para jugar?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Unite a la comunidad de fútbol amateur más grande de Uruguay. Es gratis.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/register">Creá tu cuenta gratis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="font-semibold">FutbolMatch Uruguay</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La comunidad #1 del fútbol amateur en Uruguay.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Producto</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</Link></li>
                <li><Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cómo funciona</Link></li>
                <li><Link href="#premium" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Premium</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Compañía</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-muted-foreground">Sobre nosotros</span></li>
                <li><span className="text-sm text-muted-foreground">Contacto</span></li>
                <li><span className="text-sm text-muted-foreground">Términos y condiciones</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Seguinos</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-muted-foreground">Instagram</span></li>
                <li><span className="text-sm text-muted-foreground">Twitter</span></li>
                <li><span className="text-sm text-muted-foreground">Facebook</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} FutbolMatch Uruguay. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
