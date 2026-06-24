"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowRight } from "lucide-react"
import { getInitials, formatRelativeTime } from "@/lib/utils"
import type { Post } from "@/lib/types"

export function RecentFeed({ posts }: { posts: Post[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Feed reciente</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/feed">Ver todo <ArrowRight className="h-4 w-4 ml-1" /></Link>
        </Button>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay publicaciones aún. ¡Sé el primero en publicar!
          </p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getInitials(post.user_id)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-2">{post.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeTime(post.created_at)} · {post.likes_count} likes
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
