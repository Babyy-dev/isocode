export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-sm bg-line/70 motion-safe:animate-pulse ${className}`}
    />
  );
}

export function LoadingStatus() {
  return (
    <p role="status" className="sr-only">
      Loading, please wait. लोड हो रहा है।
    </p>
  );
}
