'use client';
import Link from 'next/link';
import { useEffect, type ChangeEvent, type ReactNode } from 'react';
import { Spinner } from '@/components/ui';
import '@/styles/liquid-glass.css';

function useGlassSpotlight(): void {
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      const glass = event.target.closest<HTMLElement>('.lg-glass');
      if (!glass) return;
      const { left, top } = glass.getBoundingClientRect();
      glass.style.setProperty('--mx', `${event.clientX - left}px`);
      glass.style.setProperty('--my', `${event.clientY - top}px`);
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => document.removeEventListener('pointermove', onMove);
  }, []);
}

interface LiquidShellProps {
  children: ReactNode;
  /** `wide` para dashboards y tablas, `narrow` para listados cortos. */
  size?: 'wide' | 'narrow';
}

/**
 * Contenedor de página: fondo carbón con blobs fluidos y ancho máximo.
 * Envuelve el contenido de cada pantalla de administración.
 */
export function LiquidShell({ children, size = 'wide' }: LiquidShellProps) {
  useGlassSpotlight();
  return (
    <div className="lg-root">
      <div className="lg-blob lg-blob--1" aria-hidden />
      <div className="lg-blob lg-blob--2" aria-hidden />
      <div className="lg-blob lg-blob--3" aria-hidden />
      <div className={`lg-wrap ${size === 'wide' ? 'max-w-7xl' : 'max-w-4xl'}`}>{children}</div>
    </div>
  );
}

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  /** Si se indica, muestra un botón «←» hacia esa ruta. */
  backHref?: string;
  /** Contenido alineado a la derecha (botones, chip de usuario…). */
  action?: ReactNode;
}

/** Cabecera estándar: sobretítulo, título con degradado y acción opcional. */
export function PageHeader({ eyebrow, title, backHref, action }: PageHeaderProps) {
  return (
    <header className="lg-header">
      <span className="lg-header__bar" aria-hidden />
      <div className="flex items-center gap-4">
        {backHref && (
          <Link href={backHref} className="lg-btn lg-back" aria-label="Volver">
            ←
          </Link>
        )}
        <div>
          <p className="lg-eyebrow">{eyebrow}</p>
          <h1 className="lg-title">{title}</h1>
        </div>
      </div>
      {action}
    </header>
  );
}

/** Tarjeta de cristal con título y contenido; `flush` quita el padding del cuerpo (para listas). */
export function GlassPanel({
  title,
  aside,
  flush = false,
  className = '',
  children,
}: {
  title?: string;
  aside?: ReactNode;
  flush?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`lg-glass ${className}`}>
      {title && (
        <div className="lg-panel-head">
          <h2 className="lg-heading">{title}</h2>
          {aside}
        </div>
      )}
      <div className={flush ? undefined : 'lg-panel-body'}>{children}</div>
    </section>
  );
}

/** Banner de error accesible. No renderiza nada si `message` es `null`. */
export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="lg-error" role="alert">
      {message}
    </div>
  );
}

export function EmptyState({ icon, title, hint }: { icon: ReactNode; title: string; hint?: string }) {
  return (
    <div className="lg-empty">
      <span className="lg-empty__icon">{icon}</span>
      <p className="lg-empty__title">{title}</p>
      {hint && <p className="lg-empty__hint">{hint}</p>}
    </div>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <LiquidShell>
      <div className="lg-center">
        <Spinner />
        <p className="lg-eyebrow">{label}</p>
      </div>
    </LiquidShell>
  );
}

export function AccessDenied() {
  return (
    <LiquidShell>
      <div className="lg-center">
        <h1 className="lg-title">Acceso Denegado</h1>
        <p className="lg-eyebrow">No tienes permiso para acceder</p>
      </div>
    </LiquidShell>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="lg-search">
      <span aria-hidden>🔍</span>
      <input
        type="search"
        className="lg-input"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
    </div>
  );
}
