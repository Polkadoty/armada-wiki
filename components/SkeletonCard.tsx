import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  lines?: number;
}

export function SkeletonCard({
  className,
  showImage = true,
  lines = 3
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 space-y-3",
        className
      )}
    >
      {showImage && (
        <div className="skeleton h-32 w-full rounded-md" />
      )}
      <div className="space-y-2">
        <div className="skeleton h-5 w-3/4 rounded" />
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "skeleton h-3 rounded",
              i === lines - 1 ? "w-1/2" : "w-full"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonCardGrid({
  count = 6,
  showImage = true,
  lines = 3,
  className
}: {
  count?: number;
  showImage?: boolean;
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} showImage={showImage} lines={lines} />
      ))}
    </div>
  );
}
