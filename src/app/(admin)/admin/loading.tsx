export default function AdminLoading() {
  return (
    <main className="space-y-6 p-4 sm:p-8 lg:p-12">
      <div className="animate-pulse rounded-3xl bg-ink p-6 dark:bg-zinc-900 sm:p-8">
        <div className="h-4 w-40 rounded-full bg-white/15" />
        <div className="mt-5 h-12 max-w-xl rounded-2xl bg-white/15" />
        <div className="mt-4 h-5 max-w-2xl rounded-full bg-white/10" />
      </div>
      <section className="grid animate-pulse gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-ink/5 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-zinc-900">
            <div className="flex justify-between gap-4">
              <div className="h-4 w-32 rounded-full bg-ink/10 dark:bg-white/10" />
              <div className="size-10 rounded-xl bg-ink/10 dark:bg-white/10" />
            </div>
            <div className="mt-5 h-10 w-28 rounded-full bg-ink/10 dark:bg-white/10" />
            <div className="mt-4 h-4 w-44 rounded-full bg-ink/10 dark:bg-white/10" />
          </div>
        ))}
      </section>
      <div className="grid animate-pulse gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="h-72 rounded-2xl border border-ink/5 bg-white dark:border-white/10 dark:bg-zinc-900" />
        <div className="h-72 rounded-2xl border border-ink/5 bg-white dark:border-white/10 dark:bg-zinc-900" />
      </div>
    </main>
  );
}
