import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Percent, 
  Target, 
  AlertTriangle,
  Bot,
  Menu,
  X,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/follow-ups', label: 'Follow-ups', icon: MessageSquare },
  { path: '/templates', label: 'Templates', icon: FileText },
  { path: '/descontos', label: 'Descontos', icon: Percent },
  { path: '/metas', label: 'Metas', icon: Target },
  { path: '/objecoes', label: 'Objeções', icon: AlertTriangle },
  { path: '/jarvis', label: 'Jarvis IA', icon: Bot },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen transition-all duration-300',
        'bg-sidebar border-r border-sidebar-border',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Zap className="h-8 w-8 text-primary" />
              <div className="absolute inset-0 animate-glow-pulse rounded-full" />
            </div>
            <span className="font-bold text-lg gradient-text">JARVIS</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                'hover:bg-sidebar-accent group',
                isActive && 'bg-sidebar-accent jarvis-border',
                isCollapsed && 'justify-center'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  isActive ? 'text-primary' : 'text-sidebar-foreground group-hover:text-primary'
                )}
              />
              {!isCollapsed && (
                <span
                  className={cn(
                    'font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-sidebar-foreground group-hover:text-primary'
                  )}
                >
                  {item.label}
                </span>
              )}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="jarvis-glass rounded-lg p-3">
            <p className="text-xs text-muted-foreground text-center">
              Seu cérebro de vendas
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
