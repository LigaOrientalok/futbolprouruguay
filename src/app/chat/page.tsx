"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect, useRef } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getUserChats, getChatMessages, getUserById } from "@/lib/actions"
import { useAuth } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MessageCircle, ArrowLeft, CheckCheck } from "lucide-react"
import { getInitials, formatRelativeTime } from "@/lib/utils"
import { EmptyState } from "@/components/ui/empty-state"
import type { User } from "@/lib/types"
import { getPusherClient } from "@/lib/pusher/client"

export default function ChatPage() {
  const { user: authUser, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [showMobileList, setShowMobileList] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: chats = [], isLoading: chatsLoading } = useQuery({
    queryKey: ["chats", authUser?.id],
    queryFn: async () => {
      if (!authUser) return []
      const userChats = await getUserChats(authUser.id)
      return await Promise.all(
        userChats.map(async (chat) => {
          const otherUserId = chat.participants.find((p) => p !== authUser.id)
          if (otherUserId) {
            const otherUser = await getUserById(otherUserId)
            return { ...chat, otherUser: otherUser || undefined }
          }
          return chat
        })
      )
    },
    enabled: !!authUser,
  })

  const { data: messages = [] } = useQuery({
    queryKey: ["chat-messages", activeChat],
    queryFn: () => getChatMessages(activeChat!),
    enabled: !!activeChat,
  })

  useEffect(() => {
    if (!activeChat) return
    const pc = getPusherClient()
    if (!pc) return
    const channel = pc.subscribe(`chat-${activeChat}`)
    channel.bind("new-message", () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", activeChat] })
    })
    return () => {
      channel.unbind_all()
      pc.unsubscribe(`chat-${activeChat}`)
    }
  }, [activeChat, queryClient])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage() {
    if (!newMessage.trim() || !activeChat) return

    await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: activeChat, content: newMessage.trim() }),
    })

    setNewMessage("")
    queryClient.invalidateQueries({ queryKey: ["chat-messages", activeChat] })
  }

  if (authLoading || chatsLoading) {
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
                <EmptyState variant="message" />
              ) : (
                <div className="py-1">
                  {chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => { setActiveChat(chat.id); setShowMobileList(false) }}
                      className={`w-full p-3 flex items-center gap-3 hover:bg-accent hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-left border-l-2 ${
                        activeChat === chat.id ? "bg-accent border-l-primary" : "border-l-transparent"
                      }`}
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={(chat as { otherUser?: User }).otherUser?.avatar_url || undefined} />
                        <AvatarFallback>{(chat as { otherUser?: User }).otherUser ? getInitials((chat as { otherUser?: User }).otherUser!.full_name) : "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{(chat as { otherUser?: User }).otherUser?.full_name || "Usuario"}</p>
                        {chat.last_message && (
                          <p className="text-xs text-muted-foreground truncate">{chat.last_message}</p>
                        )}
                      </div>
                      {chat.last_message_at && (
                        <span className="text-[10px] text-muted-foreground shrink-0">{formatRelativeTime(chat.last_message_at)}</span>
                      )}
                    </button>
                  ))}
                </div>
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
              <div className="p-3 border-b flex items-center gap-3 animate-fade-in">
                <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={() => setShowMobileList(true)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={(activeChatData as { otherUser?: User }).otherUser?.avatar_url || undefined} />
                  <AvatarFallback>{(activeChatData as { otherUser?: User }).otherUser ? getInitials((activeChatData as { otherUser?: User }).otherUser!.full_name) : "?"}</AvatarFallback>
                </Avatar>
                <p className="font-medium text-sm">{(activeChatData as { otherUser?: User }).otherUser?.full_name}</p>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map((msg, index) => (
                    <div
                      key={msg.id}
                      className={`flex animate-fade-in-up ${msg.sender_id === authUser?.id ? "justify-end" : "justify-start"}`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className={`max-w-[75%] shadow-sm px-3 py-2 text-sm ${
                        msg.sender_id === authUser?.id
                          ? "bg-primary text-primary-foreground rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl"
                          : "bg-muted rounded-tl-2xl rounded-tr-2xl rounded-br-2xl"
                      }`}>
                        <p>{msg.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] opacity-70">{formatRelativeTime(msg.created_at)}</span>
                          {msg.sender_id === authUser?.id && (
                            <CheckCheck className="h-3 w-3 text-primary-foreground/60" />
                          )}
                        </div>
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
