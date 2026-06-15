export default function AppLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <div className="flex items-center gap-3 rounded-[2rem] border border-white/60 bg-white/90 px-5 py-4 text-sm font-semibold text-brand-900 shadow-soft backdrop-blur-sm">
        <span className="size-3 animate-pulse rounded-full bg-brand-500" />
        Loading experience...
      </div>
    </div>
  )
}
