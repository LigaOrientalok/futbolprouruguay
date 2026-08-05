"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, X, Send, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/auth-client"
import { toast } from "@/components/ui/use-toast"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "¡Hola! Soy FutbolBot, el asistente de FutbolMatch Uruguay. ¿En qué te ayudo?",
}

export function ChatbotWidget() {
  const { user, loading } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isSending])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  if (loading || !user) return null

  async function sendMessage() {
    const content = input.trim()
    if (!content || isSending) return

    const userMessage: ChatMessage = { role: "user", content }
    setInput("")
    setMessages((prev) => [...prev, userMessage])
    setIsSending(true)

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Error del asistente")
      }
      if (!res.body) throw new Error("Sin respuesta")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ""
      setMessages((prev) => [...prev, { role: "assistant", content: "" }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: "assistant", content: acc }
          return copy
        })
      }
    } catch (error) {
      console.error("Chatbot error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo conectar con el asistente.",
      })
      setMessages((prev) => prev.filter((m) => m.content !== ""))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <Button
        size="icon"
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar asistente" : "Abrir asistente"}
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </Button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl animate-fade-in-up">
          <div className="flex items-center gap-3 border-b p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight">FutbolBot</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                En línea
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex animate-fade-in-up ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <MessageCircle className="h-4 w-4 shrink-0 mt-2 mr-2 text-muted-foreground" />
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2 text-sm whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl"
                        : "bg-muted rounded-tl-2xl rounded-tr-2xl rounded-br-2xl"
                    }`}
                  >
                    {msg.content || (
                      <span className="flex gap-1 items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-3 flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Escribí tu pregunta..."
              disabled={isSending}
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!input.trim() || isSending}
              aria-label="Enviar"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
