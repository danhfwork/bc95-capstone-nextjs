import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePageLoading() {
  return (
    <main className="flex-1 bg-slate-50" aria-busy="true">
      <div className="bg-blue-700">
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-10 sm:px-6 lg:px-8">
          <Skeleton className="size-24 shrink-0 rounded-2xl bg-blue-300" />
          <div className="w-full max-w-sm space-y-3">
            <Skeleton className="h-8 w-full bg-blue-300" />
            <Skeleton className="h-5 w-2/3 bg-blue-300" />
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
        <Skeleton className="h-40 rounded-xl bg-slate-200" />
        <Skeleton className="h-96 rounded-xl bg-slate-200 lg:col-span-3" />
      </div>
    </main>
  );
}
