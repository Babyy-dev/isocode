import { LoadingStatus, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="page-container space-y-6 py-16" aria-busy="true">
      <LoadingStatus />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-32 max-w-xl" />
      <Skeleton className="h-12 w-32" />
    </main>
  );
}
