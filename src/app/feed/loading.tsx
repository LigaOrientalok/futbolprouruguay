import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"

export default function FeedLoading() {
  return (
    <div className="space-y-6 animate-pulse max-w-2xl mx-auto">
      <div className="space-y-2">
        <div className="h-8 w-32 bg-muted rounded" />
        <div className="h-4 w-56 bg-muted rounded" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>

      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-48 bg-muted rounded" />
          </CardContent>
          <CardFooter className="flex gap-4">
            <div className="h-8 w-16 bg-muted rounded" />
            <div className="h-8 w-16 bg-muted rounded" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
