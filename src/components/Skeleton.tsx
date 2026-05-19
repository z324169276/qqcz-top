export function Skeleton({ className = '', animate = true }: { className?: string; animate?: boolean }) {
  return (
    <div
      className={`bg-gray-200 rounded-lg ${animate ? 'animate-pulse' : ''} ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 card-shadow">
      <div className="flex items-start gap-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-lg" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonReward() {
  return (
    <div className="bg-white rounded-xl p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-5 w-1/2 mb-1" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonHeader() {
  return (
    <div className="bg-gradient-to-r from-primary to-accent p-6 rounded-3xl">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="w-16 h-16 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="w-5 h-5 rounded-full" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="text-center mb-4">
        <Skeleton className="w-16 h-16 mx-auto mb-2 rounded-full" />
        <Skeleton className="h-8 w-24 mx-auto" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
