import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface JarvisCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function JarvisCard({ 
  children, 
  className, 
  glow = false,
  title,
  description,
  icon,
  action
}: JarvisCardProps) {
  return (
    <div
      className={cn(
        'jarvis-glass rounded-xl p-5 animate-fade-in',
        glow && 'jarvis-glow',
        className
      )}
    >
      {(title || icon || action) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="font-semibold text-lg">{title}</h3>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
