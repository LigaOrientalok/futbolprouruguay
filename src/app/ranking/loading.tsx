export default function RankingLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-56 bg-muted rounded" />
        <div className="h-4 w-40 bg-muted rounded" />
      </div>

      <div className="flex gap-2">
        <div className="h-10 w-32 bg-muted rounded" />
        <div className="h-10 w-32 bg-muted rounded" />
        <div className="h-10 w-32 bg-muted rounded" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-lg border"
          >
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <div className="h-4 w-4 bg-muted-foreground/30 rounded" />
            </div>
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-40 bg-muted rounded" />
              <div className="flex gap-4">
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            </div>
            <div className="h-8 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
