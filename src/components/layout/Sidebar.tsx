import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Percent, 
  Target, 
  Bot,
  Menu,
  X,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/templates', label: 'Templates', icon: FileText },
  { path: '/descontos', label: 'Descontos', icon: Percent },
  { path: '/metas', label: 'Metas', icon: Target },
  { path: '/jarvis', label: 'Jarvis IA', icon: Bot },
  { path: '/configuracoes', label: 'Configurações', icon: Settings },
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
            <span className="triade-symbol text-primary text-xl font-bold select-none">✦</span>
            <span className="font-display font-bold text-lg tracking-tight text-foreground">TRIADE</span>
          </div>
        )}
        {isCollapsed && (
          <span className="triade-symbol text-primary text-lg font-bold select-none mx-auto">✦</span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground",
            isCollapsed && "hidden"
          )}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Expand button when collapsed */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-full flex justify-center p-3 hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

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
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'hover:bg-sidebar-accent group',
                isActive && 'bg-sidebar-accent border border-primary/20',
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
                    'text-sm font-medium transition-colors',
                    isActive ? 'text-foreground' : 'text-sidebar-foreground group-hover:text-foreground'
                  )}
                >
                  {item.label}
                </span>
              )}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="rounded-lg border border-border p-3 bg-secondary/30">
            <p className="text-xs text-muted-foreground text-center font-mono">
              Central de Comando
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
