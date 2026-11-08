/* Design source: commons_loading_screen.html (docs/mockups/) — pulsing glass
   card, indeterminate loading bar. Background blobs come from the global layout. */
export function LoadingScreen({ label = 'Cargando comunidad...' }: { label?: string }) {
  return (
    <div className="relative z-10 flex items-center justify-center px-4 py-24" role="status" aria-live="polite">
      <main className="w-full max-w-sm">
        <div className="glass soft-pulse flex flex-col items-center rounded-3xl p-10 text-center">
          <div className="mb-8 flex items-center gap-3">
            <span
              className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-xl font-bold text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              aria-hidden
            >
              C
            </span>
            <span className="text-3xl font-bold tracking-tight text-slate-100">Commons</span>
          </div>

          <div className="loading-bar-container mb-6 h-1.5 w-full">
            <div className="loading-bar-indicator" />
          </div>

          <p className="animate-pulse text-sm font-medium uppercase tracking-[0.1em] text-[var(--text-secondary)]">
            {label}
          </p>
        </div>
      </main>
    </div>
  );
}
