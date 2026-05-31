export default function ShopLoading() {
  return (
    <main className="hm-shell py-10 sm:py-16">
      <div className="animate-pulse space-y-8">
        <div className="h-8 w-40 rounded-full bg-ink/10 dark:bg-white/10" />
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="hidden rounded-3xl bg-ink/5 p-5 dark:bg-white/10 lg:block">
            <div className="h-8 rounded-xl bg-ink/10 dark:bg-white/10" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-10 rounded-xl bg-ink/10 dark:bg-white/10" />
              ))}
            </div>
          </div>
          <div className="grid gap-4 min-[430px]:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-ink/5 bg-white dark:border-white/10 dark:bg-zinc-900">
                <div className="aspect-[4/5] bg-ink/10 dark:bg-white/10" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-2/3 rounded-full bg-ink/10 dark:bg-white/10" />
                  <div className="h-7 rounded-full bg-ink/10 dark:bg-white/10" />
                  <div className="h-5 w-1/2 rounded-full bg-ink/10 dark:bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
