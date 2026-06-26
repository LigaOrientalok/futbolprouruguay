"use client"

import { useState, useRef, useMemo, useEffect, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getFeedPosts, getPostComments, getUserLikes, createPost, toggleLike, addComment, getUsers } from "@/lib/actions"
import { uploadFiles } from "@/lib/uploadthing"
import { useAuth } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Send, Image as ImageIcon, ArrowLeft, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/use-toast"
import { getInitials, formatRelativeTime } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import type { Post } from "@/lib/types"

function MentionInput({
  value, onChange, onKeyDown, placeholder,
}: {
  value: string
  onChange: (v: string) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  placeholder?: string
}) {
  const [mentionSearch, setMentionSearch] = useState("")
  const [showMentions, setShowMentions] = useState(false)
  const [cursorPos, setCursorPos] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: allUsers = [] } = useQuery({
    queryKey: ["users-for-mentions"],
    queryFn: () => getUsers(200),
    staleTime: 60000,
  })

  const filteredUsers = useMemo(() => {
    if (!mentionSearch) return []
    const q = mentionSearch.toLowerCase()
    return allUsers.filter(u =>
      u.username?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q)
    ).slice(0, 5)
  }, [allUsers, mentionSearch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const pos = e.target.selectionStart || 0
    setCursorPos(pos)

    const textBefore = val.slice(0, pos)
    const atIndex = textBefore.lastIndexOf("@")
    if (atIndex !== -1 && (atIndex === 0 || textBefore[atIndex - 1] === " ")) {
      const search = textBefore.slice(atIndex + 1)
      if (!search.includes(" ")) {
        setMentionSearch(search)
        setShowMentions(true)
        onChange(val)
        return
      }
    }
    setShowMentions(false)
    onChange(val)
  }

  const selectMention = (username: string) => {
    const textBefore = value.slice(0, cursorPos)
    const atIndex = textBefore.lastIndexOf("@")
    const textAfter = value.slice(cursorPos)
    const newVal = textBefore.slice(0, atIndex) + `@${username} ` + textAfter
    onChange(newVal)
    setShowMentions(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative flex-1">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder || "Escribí un comentario..."}
        className="flex-1"
      />
      {showMentions && filteredUsers.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-popover border rounded-lg shadow-lg z-50 max-h-40 overflow-auto">
          {filteredUsers.map(u => (
            <button
              key={u.id}
              onClick={() => selectMention(u.username)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent text-left"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={u.avatar_url || undefined} />
                <AvatarFallback className="text-[10px]">{getInitials(u.full_name)}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{u.full_name}</span>
              <span className="text-muted-foreground">@{u.username}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function renderText(text: string) {
  const parts = text.split(/(@\w+)/g)
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      const username = part.slice(1)
      return (
        <Link
          key={i}
          href={`/profile?user=${username}`}
          className="text-primary font-medium hover:underline"
        >
          {part}
        </Link>
      )
    }
    return part
  })
}

function Lightbox({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: {
  images: string[]
  currentIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") onPrev()
      if (e.key === "ArrowRight") onNext()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose, onPrev, onNext])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full z-10 transition-colors"
        aria-label="Cerrar"
      >
        <X className="h-8 w-8" />
      </button>

      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}

      <Image
        src={images[currentIndex]}
        alt=""
        width={1200}
        height={900}
        className="max-h-[90vh] max-w-[90vw] object-contain select-none"
        onClick={(e) => e.stopPropagation()}
        unoptimized
      />

      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext() }}
          className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10"
          aria-label="Siguiente"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  )
}

export default function FeedPage() {
  const { user: authUser } = useAuth()
  const queryClient = useQueryClient()
  const [newPost, setNewPost] = useState("")
  const [postFiles, setPostFiles] = useState<File[]>([])
  const [postPreviews, setPostPreviews] = useState<string[]>([])
  const postPreviewsRef = useRef<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})
  const [lightboxPostId, setLightboxPostId] = useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["feed"],
    queryFn: getFeedPosts,
  })

  const postIds = posts.map((p) => p.id)

  const { data: commentsByPost = {} as Record<string, Awaited<ReturnType<typeof getPostComments>>> } = useQuery({
    queryKey: ["feed-comments", ...postIds],
    queryFn: async () => {
      const comments = await getPostComments(postIds)
      const grouped: Record<string, typeof comments> = {}
      for (const c of comments) {
        if (!grouped[c.post_id]) grouped[c.post_id] = []
        grouped[c.post_id].push(c)
      }
      return grouped
    },
    enabled: postIds.length > 0,
  })

  const { data: likedPostIds = [] as { post_id: string }[] } = useQuery({
    queryKey: ["feed-likes", authUser?.id, ...postIds],
    queryFn: () => getUserLikes(authUser!.id, postIds),
    enabled: !!authUser && postIds.length > 0,
  })

  const likedSet = new Set(likedPostIds.map((l) => l.post_id))

  const lightboxPost = lightboxPostId ? posts.find((p) => p.id === lightboxPostId) : null
  const lightboxImages = lightboxPost ? (lightboxPost as Post & { image_urls: string[] }).image_urls || [] : []

  const handleLightboxPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : lightboxImages.length - 1))
  }, [lightboxImages.length])

  const handleLightboxNext = useCallback(() => {
    setLightboxIndex((prev) => (prev < lightboxImages.length - 1 ? prev + 1 : 0))
  }, [lightboxImages.length])

  useEffect(() => {
    return () => {
      postPreviewsRef.current.forEach(u => URL.revokeObjectURL(u))
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 4 - postFiles.length)
    setPostFiles(prev => [...prev, ...files])
    for (const file of files) {
      const url = URL.createObjectURL(file)
      setPostPreviews(prev => [...prev, url])
      postPreviewsRef.current = [...postPreviewsRef.current, url]
    }
    if (e.target) e.target.value = ""
  }

  const removeFile = (index: number) => {
    URL.revokeObjectURL(postPreviews[index])
    postPreviewsRef.current = postPreviewsRef.current.filter((_, i) => i !== index)
    setPostFiles(prev => prev.filter((_, i) => i !== index))
    setPostPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const createPostMutation = useMutation({
    mutationFn: async () => {
      let imageUrls: string[] = []
      if (postFiles.length > 0) {
        setUploading(true)
        const res = await uploadFiles("postImage", { files: postFiles })
        imageUrls = res.map(r => r.url).filter(Boolean)
      }
      return createPost(newPost.trim(), imageUrls)
    },
      onSuccess: () => {
        setNewPost("")
        setPostFiles([])
        postPreviews.forEach(u => URL.revokeObjectURL(u))
        postPreviewsRef.current = []
        setPostPreviews([])
        setUploading(false)
        queryClient.invalidateQueries({ queryKey: ["feed"] })
        toast({ title: "Publicado", description: "Tu publicación se compartió correctamente", variant: "success" })
      },
    onError: () => {
      setUploading(false)
    },
  })

  const toggleLikeMutation = useMutation({
    mutationFn: (postId: string) => toggleLike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] })
      queryClient.invalidateQueries({ queryKey: ["feed-likes"] })
      toast({ title: "Like actualizado", description: "Cambiaste tu reacción", variant: "success" })
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo actualizar el like", variant: "destructive" })
    },
  })

  const addCommentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) => addComment(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] })
      queryClient.invalidateQueries({ queryKey: ["feed-comments"] })
    },
  })

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim()
    if (!text) return
    addCommentMutation.mutate({ postId, content: text })
    setCommentInputs({ ...commentInputs, [postId]: "" })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feed</h1>
          <p className="text-muted-foreground">Últimas novedades de la comunidad</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard"><ArrowLeft className="h-4 w-4 mr-2" />Atrás</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={authUser?.avatar_url || undefined} />
              <AvatarFallback>{authUser ? getInitials(authUser.full_name) : "?"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="¿Qué estás compartiendo?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                rows={3}
                className="resize-none"
              />
              {postPreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {postPreviews.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt="" className="h-20 w-20 object-cover rounded-md border" />
                      <button onClick={() => removeFile(i)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={postFiles.length >= 4}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={() => createPostMutation.mutate()}
                  disabled={(!newPost.trim() && postFiles.length === 0) || createPostMutation.isPending}
                >
                  {createPostMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  {uploading ? "Subiendo..." : "Publicar"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState variant="feed" action={{ label: "Sé el primero", href: "#" }} />
      ) : (
        <div className="space-y-4">
          {posts.map((post, index) => {
            const p = post as Post & { user: { id: string; full_name: string; avatar_url: string | null }; image_urls: string[] }
            const images = p.image_urls || []
            return (
            <Card key={post.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader className="p-4 pb-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={p.user?.avatar_url || undefined} />
                    <AvatarFallback>{p.user ? getInitials(p.user.full_name) : "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{p.user?.full_name || "Usuario"}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(post.created_at)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <p className="text-sm whitespace-pre-wrap">{renderText(post.content)}</p>
                {images.length > 0 && (
                  <div className={`grid gap-1 ${images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : images.length === 4 ? "grid-cols-2" : "grid-cols-2"}`}>
                    {images.map((url, i) => (
                      <div
                        key={i}
                        className={`relative overflow-hidden rounded-lg border bg-muted cursor-pointer ${images.length === 1 ? "max-h-[500px]" : images.length === 3 && i === 0 ? "row-span-2" : ""}`}
                        onClick={() => { setLightboxPostId(post.id); setLightboxIndex(i) }}
                      >
                        <Image
                          src={url}
                          alt=""
                          fill
                          className="object-contain"
                          unoptimized
                        />
                        <div className={images.length === 1 ? "pb-[60%]" : "pb-[100%]"}>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0 flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleLikeMutation.mutate(post.id)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Heart className={`h-4 w-4 ${likedSet.has(post.id) ? "fill-primary text-primary" : ""}`} />
                    {post.likes_count || 0}
                  </button>
                  <button onClick={() => setExpandedComments({ ...expandedComments, [post.id]: !expandedComments[post.id] })} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    {post.comments_count || 0}
                  </button>
                </div>

                {expandedComments[post.id] && (
                  <div className="space-y-3 w-full">
                    <div className="flex gap-2">
                      <MentionInput
                        value={commentInputs[post.id] || ""}
                        onChange={(v) => setCommentInputs({ ...commentInputs, [post.id]: v })}
                        onKeyDown={(e) => (e as React.KeyboardEvent).key === "Enter" && !(e as React.KeyboardEvent).shiftKey && handleAddComment(post.id)}
                        placeholder="Escribí un comentario... @ para mencionar"
                      />
                      <Button size="icon" variant="ghost" onClick={() => handleAddComment(post.id)}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {(commentsByPost[post.id] || []).map((comment) => {
                        const c = comment as typeof comment & { user: { id: string; full_name: string; avatar_url: string | null } }
                        return (
                        <div key={c.id} className="flex gap-2">
                          <Avatar className="h-6 w-6 shrink-0">
                            <AvatarImage src={c.user?.avatar_url || undefined} />
                            <AvatarFallback className="text-[10px]">{c.user ? getInitials(c.user.full_name) : "?"}</AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <Link href={`/profile?user=${c.user?.id}`} className="font-medium hover:underline">{c.user?.full_name || "Usuario"}</Link>
                            {" "}{renderText(c.content)}
                          </div>
                        </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>
            )
          })}
        </div>
      )}

      {lightboxPostId && lightboxImages.length > 0 && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxPostId(null)}
          onPrev={handleLightboxPrev}
          onNext={handleLightboxNext}
        />
      )}
    </div>
  )
}
