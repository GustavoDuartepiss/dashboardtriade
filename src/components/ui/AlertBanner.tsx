import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertBannerProps {
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  onDismiss?: () => void;
}

const icons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: XCircle,
};

const styles = {
  info: 'border-primary/30 bg-primary/5',
  warning: 'border-warning/30 bg-warning/5',
  success: 'border-success/30 bg-success/5',
  error: 'border-destructive/30 bg-destructive/5',
};

const iconStyles = {
  info: 'text-primary',
  warning: 'text-warning',
  success: 'text-success',
  error: 'text-destructive',
};

export function AlertBanner({ type, title, message, onDismiss }: AlertBannerProps) {
  const Icon = icons[type];

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-xl border animate-slide-in-right',
        styles[type]
      )}
    >
      <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', iconStyles[type])} />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-sm text-muted-foreground mt-0.5">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
