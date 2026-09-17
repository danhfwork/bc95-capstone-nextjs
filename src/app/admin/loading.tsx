export default function AdminLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse space-y-6 px-4 py-8 motion-reduce:animate-none sm:px-6 lg:px-8">
      <div className="h-9 w-64 rounded-lg bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 rounded-2xl bg-slate-200" />
        ))}
      </div>
      <div className="h-80 rounded-2xl bg-slate-200" />
    </div>
  );
}
