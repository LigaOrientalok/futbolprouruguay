import { Card, CardContent } from "@/components/ui/card"

export default function ChatLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-32 bg-muted rounded" />
        <div className="h-4 w-48 bg-muted rounded" />
      </div>

      <div className="flex h-[60vh] gap-4">
        <div className="w-80 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>

        <Card className="flex-1">
          <CardContent className="p-6 space-y-4 h-full flex flex-col">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                  <div className={`h-12 w-64 bg-muted rounded-2xl ${i % 2 === 1 ? "rounded-br-sm" : "rounded-bl-sm"}`} />
                </div>
              ))}
            </div>

            <div className="h-12 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
