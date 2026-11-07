import { LoadingStatus, Skeleton } from "@/components/ui/skeleton";

export function CatalogueSkeleton() {
  return (
    <main className="page-container py-12" aria-busy="true">
      <LoadingStatus />
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-6 py-10">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-16 w-4/5" />
          <Skeleton className="h-16 w-3/5" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-48" />
        </div>
        <Skeleton className="min-h-96" />
      </div>
      <Skeleton className="mt-16 h-10 w-2/3" />
      <Skeleton className="mt-8 h-24 w-full" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <CarCardSkeleton key={key} />
        ))}
      </div>
    </main>
  );
}

function CarCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-4 p-6">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
      </div>
    </div>
  );
}

export function CarDetailSkeleton() {
  return (
    <main className="page-container space-y-8 py-10" aria-busy="true">
      <LoadingStatus />
      <Skeleton className="h-4 w-40" />
      <div className="flex justify-between gap-8">
        <Skeleton className="h-20 w-1/2" />
        <Skeleton className="h-20 w-1/4" />
      </div>
      <Skeleton className="aspect-[4/3] sm:aspect-[2.2/1]" />
      <div className="grid gap-10 lg:grid-cols-[1.25fr_0.85fr]">
        <div className="space-y-6">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-96" />
      </div>
    </main>
  );
}
