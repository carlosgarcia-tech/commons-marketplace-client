import Link from 'next/link';

export const metadata = { title: 'Acceso restringido | Commons Marketplace' };

export default function ForbiddenPage() {
  return (
    <div className="relative z-10 flex items-center justify-center px-4 py-24">
      <main className="glass panel w-full max-w-lg px-10 py-14 text-center">
        <p className="text-xs font-medium text-[var(--text-secondary)] tracking-[0.15em] uppercase mb-4">
          Acceso restringido
        </p>
        <h1 className="headline-gradient text-3xl font-extrabold md:text-4xl">
          No puedes entrar aquí
        </h1>
        <p className="mt-5 font-light text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">
          Tu cuenta no tiene los permisos para ver esta página. Si crees que es un error, habla con el equipo de moderación.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="w-full sm:w-auto">
            <span className="press inline-flex w-full items-center justify-center rounded-2xl border border-white/[0.12] bg-white/[0.12] px-6 py-3 text-sm font-semibold text-white backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 sm:w-auto">
              Volver al inicio
            </span>
          </Link>
          <Link href="/products" className="w-full sm:w-auto">
            <span className="press inline-flex w-full items-center justify-center rounded-2xl px-6 py-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-highlight)] sm:w-auto">
              Ver productos
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
