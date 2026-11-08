import Link from 'next/link';
import { Button } from '@/components/ui';

/* Design source: commons_404_error.html (docs/mockups/) — planet illustration,
   glass card, gradient headline. Background blobs come from the global layout. */
export default function NotFound() {
  return (
    <div className="relative z-10 flex items-center justify-center px-4 py-24">
      <main className="w-full max-w-lg">
        <div className="glass panel flex flex-col items-center p-10 text-center md:p-14">
          {/* Planet illustration */}
          <div className="floating-illustration relative mb-8 h-48 w-48" aria-hidden>
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-glow h-full w-full">
              <circle cx="20" cy="40" r="1.5" fill="#94a3b8" className="floating-slow" />
              <circle cx="170" cy="50" r="2" fill="#64748b" className="floating-illustration" />
              <circle cx="160" cy="160" r="1.5" fill="#94a3b8" className="floating-slow" />
              <circle cx="40" cy="150" r="2.5" fill="#64748b" className="floating-illustration" />

              <ellipse cx="100" cy="100" rx="70" ry="25" transform="rotate(-15 100 100)" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="8 4" />
              <ellipse cx="100" cy="100" rx="85" ry="30" transform="rotate(-15 100 100)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

              <circle cx="100" cy="100" r="45" fill="url(#planet-grad)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

              <ellipse cx="85" cy="85" rx="8" ry="6" transform="rotate(-30 85 85)" fill="rgba(0,0,0,0.2)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
              <circle cx="120" cy="110" r="5" fill="rgba(0,0,0,0.2)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
              <ellipse cx="90" cy="120" rx="12" ry="4" transform="rotate(10 90 120)" fill="rgba(0,0,0,0.15)" />

              <path d="M 32 118 A 70 25 0 0 0 168 81" transform="rotate(-15 100 100)" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" />

              <text x="100" y="112" fontFamily="Inter, sans-serif" fontSize="32" fontWeight="800" fill="#f8fafc" textAnchor="middle" letterSpacing="-1">404</text>

              <defs>
                <radialGradient id="planet-grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(70 70) rotate(45) scale(100)">
                  <stop stopColor="#334155" />
                  <stop offset="0.6" stopColor="#0f172a" />
                  <stop offset="1" stopColor="#020617" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          <h1 className="headline-gradient mb-3 text-3xl font-extrabold tracking-tight md:text-4xl">
            Página no encontrada
          </h1>

          <p className="mb-8 max-w-xs font-light text-[var(--text-secondary)] leading-relaxed">
            Parece que te has perdido en el vacío de la red...
          </p>

          <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Link href="/" className="group w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                <svg className="h-4 w-4 opacity-70 transition-all group-hover:-translate-x-1 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al inicio
              </Button>
            </Link>
            <Link href="/products" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Ver productos
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
