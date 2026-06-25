import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function PremiumLoading() {
  return (
    <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <div className="h-8 w-64 bg-muted rounded mx-auto" />
        <div className="h-4 w-96 bg-muted rounded mx-auto" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className={i === 1 ? "border-primary" : ""}>
            <CardHeader className="text-center space-y-2">
              <div className="h-6 w-24 bg-muted rounded mx-auto" />
              <div className="h-10 w-32 bg-muted rounded mx-auto" />
              <div className="h-4 w-40 bg-muted rounded mx-auto" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-muted rounded" />
                  <div className="h-4 flex-1 bg-muted rounded" />
                </div>
              ))}
              <div className="h-10 w-full bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
