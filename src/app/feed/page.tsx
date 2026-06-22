"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-client"
import { query, findById, findAll, insert, updateById, count } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Send, Image, Loader2, Trash2 } from "lucide-react"
import { getInitials, formatRelativeTime } from "@/lib/utils"
import type { Post, Comment, User } from "@/lib/types"

export default function FeedPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<(Post & { user?: User; comments?: Comment[] })[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [newPost, setNewPost] = useState("")
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    if (user) setCurrentUser(user as User)
  }, [user])

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    const data = await query(
      "SELECT p.*, row_to_json(u.*) as user FROM posts p JOIN users u ON u.id = p.user_id ORDER BY p.created_at DESC LIMIT 20"
    )
    const postsData = (data || []) as any

    if (postsData.length > 0) {
      const ids = postsData.map((p: any) => p.id)
      const placeholders = ids.map((_: any, i: number) => `$${i + 1}`).join(",")
      const allComments = await query(
        `SELECT * FROM comments WHERE post_id IN (${placeholders}) ORDER BY created_at ASC`,
        ids
      )
      const grouped: Record<string, any[]> = {}
      for (const c of (allComments || ([] as any[]))) {
        if (!grouped[c.post_id]) grouped[c.post_id] = []
        grouped[c.post_id].push(c)
      }
      for (const p of postsData) {
        p.comments = grouped[p.id] || []
      }
    }

    setPosts(postsData)
    setLoading(false)
  }

  async function createPost() {
    if (!newPost.trim() || !currentUser) return
    setPosting(true)
    await insert("posts", {
      user_id: currentUser.id,
      content: newPost.trim(),
      image_urls: [],
      video_url: null,
      likes_count: 0,
      comments_count: 0,
    })
    setNewPost("")
    setPosting(false)
    loadPosts()
  }

  async function toggleLike(postId: string) {
    if (!currentUser) return
    const existingLikes = await findAll("likes", {
      where: "post_id = $1 AND user_id = $2",
      params: [postId, currentUser.id],
    })
    const existingLike = (existingLikes || [])[0]

    if (existingLike) {
      await query("DELETE FROM likes WHERE id = $1", [existingLike.id])
      const post = await findById("posts", postId)
      if (post) {
        await updateById("posts", postId, { likes_count: ((post as any).likes_count || 0) - 1 })
      }
    } else {
      await insert("likes", { post_id: postId, user_id: currentUser.id } as any)
      const post = await findById("posts", postId)
      if (post) {
        await updateById("posts", postId, { likes_count: ((post as any).likes_count || 0) + 1 })
      }
    }
    loadPosts()
  }

  async function addComment(postId: string) {
    const text = commentInputs[postId]?.trim()
    if (!text || !currentUser) return

    await insert("comments", {
      post_id: postId,
      user_id: currentUser.id,
      content: text,
    } as any)

    const post = await findById("posts", postId)
    if (post) {
      await updateById("posts", postId, { comments_count: ((post as any).comments_count || 0) + 1 })
    }

    setCommentInputs({ ...commentInputs, [postId]: "" })
    loadPosts()
  }

  const hasLiked = (post: Post) => {
    return false
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
              <AvatarImage src={currentUser?.avatar_url || undefined} />
              <AvatarFallback>{currentUser ? getInitials(currentUser.full_name) : "?"}</AvatarFallback>
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
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
                <Button size="sm" onClick={createPost} disabled={!newPost.trim() || posting}>
                  {posting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Publicar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
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
                  <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Heart className={`h-4 w-4 ${hasLiked(post) ? "fill-primary text-primary" : ""}`} />
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
                        onKeyDown={(e) => e.key === "Enter" && addComment(post.id)}
                      />
                      <Button size="icon" variant="ghost" onClick={() => addComment(post.id)}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(post.comments || []).slice(0, 3).map((comment: Comment) => (
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
