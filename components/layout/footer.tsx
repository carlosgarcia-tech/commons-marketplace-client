export function Footer() {
  return (
    <footer className="relative z-10 px-4 sm:px-6 lg:px-8 mt-16 pb-6">
      <div className="glass-nav mx-auto max-w-7xl rounded-2xl px-6 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs font-medium text-[var(--text-secondary)] tracking-wide">
            &copy; 2026 Commons Marketplace
          </p>
          <p className="text-xs font-light text-[var(--text-secondary)]">
            Hecho por la comunidad que lo vende
          </p>
        </div>
      </div>
    </footer>
  );
}
