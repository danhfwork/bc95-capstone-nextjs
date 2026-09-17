export default function Loading() {
  return (
    <main
      id="main-content"
      className="grid min-h-dvh flex-1 place-items-center bg-slate-50 px-4 py-16"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="text-sm font-medium text-slate-600">Đang tải...</p>
    </main>
  );
}
