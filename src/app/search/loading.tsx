import { Card, CardContent } from "@/components/ui/card"

export default function SearchLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-4 w-64 bg-muted rounded" />
      </div>

      <div className="flex gap-3">
        <div className="h-10 flex-1 bg-muted rounded" />
        <div className="h-10 w-40 bg-muted rounded" />
        <div className="h-10 w-40 bg-muted rounded" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-36 bg-muted rounded" />
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-muted rounded-full" />
                  <div className="h-5 w-20 bg-muted rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
