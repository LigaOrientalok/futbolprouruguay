import { Card, CardContent } from "@/components/ui/card"

export default function ChallengesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-muted rounded" />
          <div className="h-4 w-40 bg-muted rounded" />
        </div>
        <div className="h-10 w-40 bg-muted rounded" />
      </div>

      <div className="flex gap-2">
        <div className="h-10 w-32 bg-muted rounded" />
        <div className="h-10 w-32 bg-muted rounded" />
        <div className="h-10 w-32 bg-muted rounded" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="h-6 w-48 bg-muted rounded" />
                  <div className="flex gap-2">
                    <div className="h-5 w-20 bg-muted rounded-full" />
                    <div className="h-5 w-24 bg-muted rounded-full" />
                  </div>
                </div>
                <div className="h-8 w-24 bg-muted rounded" />
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-muted rounded" />
                  <div className="h-4 w-28 bg-muted rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-muted rounded" />
                  <div className="h-4 w-20 bg-muted rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
