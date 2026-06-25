"use client"

import { useState, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getFeedPosts, getPostComments, getUserLikes, createPost, toggleLike, addComment } from "@/lib/actions"
import { uploadFiles } from "@/lib/uploadthing"
import { useAuth } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Send, Image as ImageIcon, ArrowLeft, Loader2, X } from "lucide-react"
import { getInitials, formatRelativeTime } from "@/lib/utils"
import Link from "next/link"
import type { Post } from "@/lib/types"

export default function FeedPage() {
  const { user: authUser } = useAuth()
  const queryClient = useQueryClient()
  const [newPost, setNewPost] = useState("")
  const [postFiles, setPostFiles] = useState<File[]>([])
  const [postPreviews, setPostPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 4 - postFiles.length)
    setPostFiles(prev => [...prev, ...files])
    for (const file of files) {
      const url = URL.createObjectURL(file)
      setPostPreviews(prev => [...prev, url])
    }
    if (e.target) e.target.value = ""
  }

  const removeFile = (index: number) => {
    URL.revokeObjectURL(postPreviews[index])
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
      setPostPreviews([])
      setUploading(false)
      queryClient.invalidateQueries({ queryKey: ["feed"] })
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
        <div className="text-center py-16 text-muted-foreground">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay publicaciones aún</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const p = post as Post & { user: { id: string; full_name: string; avatar_url: string | null } }
            const images = p.image_urls || []
            return (
            <Card key={post.id}>
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
                <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                {images.length > 0 && (
                  <div className={`grid gap-2 ${images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : images.length === 3 ? "grid-cols-2" : "grid-cols-2"}`}>
                    {images.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        className={`w-full object-cover rounded-lg border ${images.length === 1 ? "max-h-96" : "h-40"} ${images.length === 3 && i === 0 ? "row-span-2 h-full" : ""}`}
                      />
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
                      <Input
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        placeholder="Escribí un comentario..."
                        className="flex-1"
                        onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                      />
                      <Button size="icon" variant="ghost" onClick={() => handleAddComment(post.id)}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(commentsByPost[post.id] || []).map((comment) => {
                        const c = comment as typeof comment & { user: { id: string; full_name: string; avatar_url: string | null } }
                        return (
                        <div key={c.id} className="flex gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={c.user?.avatar_url || undefined} />
                            <AvatarFallback className="text-[10px]">{c.user ? getInitials(c.user.full_name) : "?"}</AvatarFallback>
                          </Avatar>
                          <p className="text-sm"><span className="font-medium">{c.user?.full_name || "Usuario"}</span> {c.content}</p>
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
    </div>
  )
}
