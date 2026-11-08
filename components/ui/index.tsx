import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { ComponentProps } from 'react';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

/* ─── Button ─────────────────────────────────────────────────────────── */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-body font-medium tracking-normal transition-all duration-200 press focus:outline-none focus:ring-2 focus:ring-primary-ghost disabled:opacity-50 disabled:pointer-events-none rounded-2xl';

  const variants = {
    primary:
      'bg-white/[0.12] backdrop-blur-xl border border-white/[0.12] text-white shadow-[0_14px_28px_-10px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.1)] hover:-translate-y-1 hover:bg-white/[0.18] hover:shadow-[0_20px_36px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)] focus:ring-white/20',
    secondary:
      'glass text-foreground hover:-translate-y-1 hover:border-white/20 hover:text-white',
    outline:
      'glass-chip rounded-2xl text-[var(--text-secondary)] hover:bg-white/[0.08] hover:text-[var(--text-highlight)]',
    ghost:
      'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-highlight)] hover:bg-white/5',
    danger:
      'bg-[var(--danger-bg)] text-[var(--danger)] border border-[var(--danger)]/30 backdrop-blur-xl hover:-translate-y-1 hover:bg-[var(--danger-bg)] hover:shadow-[0_14px_28px_-10px_rgba(248,113,113,0.25)] focus:ring-[var(--danger)]/30',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner className="mr-2 h-4 w-4" />
          Cargando...
        </>
      ) : (
        children
      )}
    </button>
  );
}

/* ─── Input ──────────────────────────────────────────────────────────── */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ className, label, error, id, maxLength, value, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = error && inputId ? `${inputId}-error` : undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium tracking-wide text-gray-600"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        value={value}
        className={cn(
          'block w-full rounded-[--radius-md] bg-white/5 border px-3 py-2.5 font-body text-sm transition-all duration-200',
          'placeholder:text-gray-400',
          'text-foreground border-[var(--glass-border)]',
          'focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-ghost)] focus:outline-none focus:bg-white/10',
          'disabled:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_var(--danger-bg)]'
            : '',
          className
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        {...props}
      />
      {error && <p className="text-xs font-medium text-danger" id={errorId}>{error}</p>}
      {!error && typeof maxLength === 'number' && (
        <p className="text-right text-[11px] text-gray-400">
          {String(value ?? '').length}/{maxLength}
        </p>
      )}
    </div>
  );
}

/* ─── Textarea ──────────────────────────────────────────────────────── */
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ className, label, error, id, maxLength, value, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium tracking-wide text-gray-600"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        value={value}
        className={cn(
          'block w-full rounded-[--radius-md] bg-white/5 border px-3 py-2.5 font-body text-sm transition-all duration-200 resize-none',
          'placeholder:text-gray-400',
          'text-foreground border-[var(--glass-border)]',
          'focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-ghost)] focus:outline-none focus:bg-white/10',
          'disabled:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_var(--danger-bg)]'
            : '',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
      {!error && typeof maxLength === 'number' && (
        <p className="text-right text-[11px] text-gray-400">
          {String(value ?? '').length}/{maxLength}
        </p>
      )}
    </div>
  );
}

/* ─── Card ──────────────────────────────────────────────────────────── */
export function Card({ className, hoverable, children, ...props }: ComponentProps<'div'> & { hoverable?: boolean }) {
  return (
    <div
      className={cn(
        'glass rounded-2xl overflow-hidden',
        hoverable && 'cursor-pointer hover:-translate-y-0.5 hover:scale-[1.01] transition-transform duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('px-5 py-4 border-b border-[var(--glass-border)] bg-white/[0.03]', className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('px-5 py-4 border-t border-[var(--glass-border)] bg-white/[0.03]', className)} {...props}>
      {children}
    </div>
  );
}

/* ─── Badge ─────────────────────────────────────────────────────────── */
export function Badge({
  className,
  children,
  variant = 'default',
  ...props
}: ComponentProps<'span'> & { variant?: 'default' | 'success' | 'warning' | 'danger' }) {
  const variants = {
    default: 'text-[var(--gray-700)]',
    success: 'text-[var(--success)] bg-[var(--success-bg)] border-[var(--success)]/25',
    warning: 'text-[var(--warning)] bg-[var(--warning-bg)] border-[var(--warning)]/25',
    danger: 'text-[var(--danger)] bg-[var(--danger-bg)] border-[var(--danger)]/25',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 font-mono text-[11px] tracking-wide rounded-full glass-chip',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/* ─── Spinner ──────────────────────────────────────────────────────── */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-5 w-5 animate-spin text-primary', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C1.568 0 0 1.568 0 3h4zm2 5.196A8 8 0 014 12H0c0 1.432 1.568 3 3 3v-4zm16-2.196V3c0-1.432-1.568-3-3-3v4zm-2 5.196a8 8 0 01-4-5.196h4a8 8 0 010 5.196z"
      />
    </svg>
  );
}

/* ─── Skeleton ─────────────────────────────────────────────────────── */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl bg-gray-100 overflow-hidden relative',
        className
      )}
      style={{
        backgroundImage: 'linear-gradient(90deg, var(--gray-100) 25%, var(--gray-200) 50%, var(--gray-100) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  );
}

export { LoadingScreen } from './loading-screen';
