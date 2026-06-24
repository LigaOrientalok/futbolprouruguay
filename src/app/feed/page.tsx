"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getFeedPosts, getPostComments, getUserLikes, createPost, toggleLike, addComment } from "@/lib/actions"
import { useAuth } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Send, Image as ImageIcon, Loader2 } from "lucide-react"
import { getInitials, formatRelativeTime } from "@/lib/utils"
import type { Post } from "@/lib/types"

export default function FeedPage() {
  const { user: authUser } = useAuth()
  const queryClient = useQueryClient()
  const [newPost, setNewPost] = useState("")
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

  const createPostMutation = useMutation({
    mutationFn: () => createPost(newPost.trim()),
    onSuccess: () => {
      setNewPost("")
      queryClient.invalidateQueries({ queryKey: ["feed"] })
    },
  })

  const toggleLikeMutation = useMutation({
    mutationFn: (postId: string) => toggleLike(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  })

  const addCommentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) => addComment(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] })
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
      <div>
        <h1 className="text-2xl font-bold">Feed</h1>
        <p className="text-muted-foreground">Últimas novedades de la comunidad</p>
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
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" disabled>
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={() => createPostMutation.mutate()}
                  disabled={!newPost.trim() || createPostMutation.isPending}
                >
                  {createPostMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Publicar
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
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="p-4 pb-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={post.user?.avatar_url || undefined} />
                    <AvatarFallback>{post.user ? getInitials(post.user.full_name) : "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{post.user?.full_name || "Usuario"}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(post.created_at)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm">{post.content}</p>
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
                      {(commentsByPost[post.id] || []).slice(0, 3).map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]">{getInitials(comment.user_id)}</AvatarFallback>
                          </Avatar>
                          <p className="text-sm"><span className="font-medium">{comment.user_id?.slice(0, 8)}</span> {comment.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
