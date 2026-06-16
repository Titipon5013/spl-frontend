import React from 'react';
import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react';

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-[var(--pp-surface-muted)] text-[var(--pp-muted)] border-[var(--pp-line)]',
  info: 'bg-[var(--pp-blue-soft)] text-[var(--pp-blue-deep)] border-[#b7d0eb]',
  success: 'bg-[var(--pp-success-soft)] text-[var(--pp-success)] border-[#b8dfcb]',
  warning: 'bg-[var(--pp-warning-soft)] text-[var(--pp-warning)] border-[#f0d48b]',
  danger: 'bg-[var(--pp-danger-soft)] text-[var(--pp-danger)] border-[#f3b5bb]',
};

export const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const variants = {
    primary: 'bg-[var(--pp-blue)] text-white border-[var(--pp-blue)] hover:bg-[var(--pp-blue-deep)]',
    secondary: 'bg-white text-[var(--pp-ink)] border-[var(--pp-line)] hover:bg-[var(--pp-surface-muted)]',
    danger: 'bg-[var(--pp-danger)] text-white border-[var(--pp-danger)] hover:bg-[#9f2630]',
    ghost: 'bg-transparent text-[var(--pp-muted)] border-transparent hover:bg-[var(--pp-surface-muted)] hover:text-[var(--pp-ink)]',
  };

  return (
    <button
      className={cx(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--pp-radius)] border px-3.5 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--pp-blue)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
};

export const Panel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <section
    className={cx('rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white', className)}
    {...props}
  >
    {children}
  </section>
);

export const PageHeader: React.FC<{
  title: string;
  description?: string;
  actions?: React.ReactNode;
}> = ({ title, description, actions }) => (
  <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
    <div>
      <h1 className="text-xl font-bold leading-tight text-[var(--pp-ink)]">{title}</h1>
      {description && <p className="mt-1 max-w-3xl text-sm text-[var(--pp-muted)]">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const Toolbar: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div
    className={cx(
      'mb-5 flex flex-col gap-3 rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white p-3 md:flex-row md:items-center md:justify-between',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}> = ({ label, value, onChange, options }) => (
  <label className="flex min-w-52 flex-col gap-1 text-sm font-semibold text-[var(--pp-ink)]">
    <span>{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-10 rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white px-3 text-sm font-medium text-[var(--pp-ink)] outline-none transition focus:border-[var(--pp-blue)] focus:ring-2 focus:ring-[var(--pp-blue)]/20"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

export const StatusBadge: React.FC<{
  tone?: Tone;
  children: React.ReactNode;
  pulse?: boolean;
}> = ({ tone = 'neutral', children, pulse = false }) => (
  <span
    className={cx(
      'inline-flex items-center gap-1.5 rounded-[var(--pp-radius)] border px-2 py-1 text-xs font-semibold',
      toneClasses[tone]
    )}
  >
    {pulse && <span className="h-2 w-2 rounded-full bg-current" />}
    {children}
  </span>
);

export const MetricTile: React.FC<{
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  meta?: React.ReactNode;
  tone?: Tone;
}> = ({ label, value, icon, meta, tone = 'neutral' }) => (
  <Panel className="p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--pp-muted)]">{label}</p>
        <div className="mt-2 text-2xl font-bold leading-none text-[var(--pp-ink)]">{value}</div>
      </div>
      {icon && (
        <div className={cx('rounded-[var(--pp-radius)] border p-2', toneClasses[tone])}>
          {icon}
        </div>
      )}
    </div>
    {meta && <div className="mt-3 text-sm text-[var(--pp-muted)]">{meta}</div>}
  </Panel>
);

export const EmptyState: React.FC<{
  title: string;
  description?: string;
  tone?: Tone;
}> = ({ title, description, tone = 'neutral' }) => {
  const icons = {
    neutral: <Info size={18} />,
    info: <Info size={18} />,
    success: <CheckCircle2 size={18} />,
    warning: <AlertTriangle size={18} />,
    danger: <XCircle size={18} />,
  };

  return (
    <div className="flex min-h-32 flex-col items-center justify-center rounded-[var(--pp-radius)] border border-dashed border-[var(--pp-line)] p-6 text-center">
      <div className={cx('mb-2 rounded-[var(--pp-radius)] border p-2', toneClasses[tone])}>{icons[tone]}</div>
      <p className="font-semibold text-[var(--pp-ink)]">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-[var(--pp-muted)]">{description}</p>}
    </div>
  );
};

export const SkeletonBlock: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cx('animate-pulse rounded-[var(--pp-radius)] bg-slate-200', className)} />
);

export const Dialog: React.FC<{
  open: boolean;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  size?: 'md' | 'lg' | 'xl';
}> = ({ open, title, children, footer, onClose, size = 'md' }) => {
  if (!open) return null;
  const sizes = { md: 'max-w-lg', lg: 'max-w-3xl', xl: 'max-w-6xl' };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className={cx('max-h-[90vh] w-full overflow-hidden rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white', sizes[size])}>
        <div className="flex items-center justify-between border-b border-[var(--pp-line)] px-4 py-3">
          <h2 id="dialog-title" className="text-base font-bold text-[var(--pp-ink)]">{title}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Close dialog" className="min-h-9 px-2">
            <XCircle size={18} />
          </Button>
        </div>
        <div className="max-h-[72vh] overflow-auto">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-[var(--pp-line)] bg-[var(--pp-canvas)] px-4 py-3">{footer}</div>}
      </div>
    </div>
  );
};
