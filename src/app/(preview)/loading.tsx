import { LoadingStatus, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section aria-busy="true">
      <LoadingStatus />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-5 h-12 w-3/4" />
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    </section>
  );
}
