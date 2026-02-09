import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon,
  trend,
  className 
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-5 animate-fade-in card-hover',
        'bg-card border border-border',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold font-mono text-foreground">{value}</p>
          {subtitle && (
            <p className={cn(
              'text-xs',
              trend === 'up' && 'text-success',
              trend === 'down' && 'text-destructive',
              trend === 'neutral' && 'text-muted-foreground'
            )}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
