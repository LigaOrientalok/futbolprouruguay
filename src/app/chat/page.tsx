"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-client"
import { query, findById, findAll, insert } from "@/lib/db-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Send, MessageCircle, Loader2, ArrowLeft } from "lucide-react"
import { getInitials, formatRelativeTime } from "@/lib/utils"
import type { Chat, Message, User } from "@/lib/types"
import { getPusherClient } from "@/lib/pusher/client"

export default function ChatPage() {
  const { user: authUser, loading: authLoading } = useAuth()
  const [chats, setChats] = useState<(Chat & { otherUser?: User })[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMobileList, setShowMobileList] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (authLoading) return
    if (!authUser) {
      setLoading(false)
      return
    }
    setCurrentUser(authUser as unknown as User)
    loadChats()
  }, [authUser, authLoading])

  useEffect(() => {
    if (activeChat) {
      loadMessages()
    }
  }, [activeChat])

  useEffect(() => {
    if (!activeChat) return
    const pc = getPusherClient()
    if (!pc) return
    const channel = pc.subscribe(`chat-${activeChat}`)
    channel.bind("new-message", (data: Message) => {
      setMessages((prev) => [...prev, data])
    })
    return () => {
      channel.unbind_all()
      pc.unsubscribe(`chat-${activeChat}`)
    }
  }, [activeChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function loadChats() {
    if (!authUser) return

    const userChats = await query<Chat>(
      "SELECT * FROM chats WHERE $1 = ANY(participants) ORDER BY last_message_at DESC NULLS LAST",
      [authUser.id]
    )

    if (userChats) {
      const enrichedChats = await Promise.all(
        userChats.map(async (chat) => {
          const otherUserId = chat.participants.find((p) => p !== authUser.id)
          if (otherUserId) {
            const otherUser = await findById<User>("users", otherUserId)
            return { ...chat, otherUser: otherUser || undefined }
          }
          return chat
        })
      )
      setChats(enrichedChats)
    }
    setLoading(false)
  }

  async function loadMessages() {
    if (!activeChat) return
    const data = await findAll<Message>("messages", {
      where: "chat_id = $1",
      params: [activeChat],
      orderBy: "created_at ASC",
    })
    setMessages(data || [])
  }

  async function sendMessage() {
    if (!newMessage.trim() || !activeChat) return

    await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: activeChat, content: newMessage.trim() }),
    })

    setNewMessage("")
  }

  async function startChat(userId: string) {
    if (!authUser) return

    const existingChats = await query<Chat>(
      "SELECT * FROM chats WHERE $1 = ANY(participants) AND $2 = ANY(participants)",
      [authUser.id, userId]
    )

    const existingChat = existingChats?.[0]

    if (existingChat) {
      setActiveChat(existingChat.id)
      setShowMobileList(false)
      return existingChat.id
    }

    const newChat = await insert<Chat>("chats", { participants: [authUser.id, userId] })

    if (newChat) {
      setActiveChat(newChat.id)
      setShowMobileList(false)
      loadChats()
      return newChat.id
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const activeChatData = chats.find((c) => c.id === activeChat)

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Chat list */}
      <div className={`${showMobileList ? "flex" : "hidden"} lg:flex w-full lg:w-80 flex-col shrink-0`}>
        <Card className="flex-1">
          <CardContent className="p-0 flex flex-col h-full">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Mensajes</h2>
            </div>
            <ScrollArea className="flex-1">
              {chats.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sin conversaciones</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => { setActiveChat(chat.id); setShowMobileList(false) }}
                    className={`w-full p-3 flex items-center gap-3 hover:bg-accent transition-colors text-left ${
                      activeChat === chat.id ? "bg-accent" : ""
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={chat.otherUser?.avatar_url || undefined} />
                      <AvatarFallback>{chat.otherUser ? getInitials(chat.otherUser.full_name) : "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{chat.otherUser?.full_name || "Usuario"}</p>
                      {chat.last_message && (
                        <p className="text-xs text-muted-foreground truncate">{chat.last_message}</p>
                      )}
                    </div>
                    {chat.last_message_at && (
                      <span className="text-[10px] text-muted-foreground">{formatRelativeTime(chat.last_message_at)}</span>
                    )}
                  </button>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chat area */}
      <div className={`${!showMobileList ? "flex" : "hidden"} lg:flex flex-1 flex-col`}>
        <Card className="flex-1 flex flex-col">
          {activeChat && activeChatData ? (
            <>
              <div className="p-3 border-b flex items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setShowMobileList(true)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activeChatData.otherUser?.avatar_url || undefined} />
                  <AvatarFallback>{activeChatData.otherUser ? getInitials(activeChatData.otherUser.full_name) : "?"}</AvatarFallback>
                </Avatar>
                <p className="font-medium text-sm">{activeChatData.otherUser?.full_name}</p>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === currentUser?.id ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        msg.sender_id === currentUser?.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}>
                        <p>{msg.content}</p>
                        <p className="text-[10px] opacity-70 mt-1">{formatRelativeTime(msg.created_at)}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <div className="p-3 border-t flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribí un mensaje..."
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Seleccioná una conversación</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
