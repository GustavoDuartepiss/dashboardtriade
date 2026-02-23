import { useEffect, useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  Calendar,
  Bot,
  Zap,
  ArrowUpRight,
  Activity,
  Tag,
  FileText
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/ui/StatCard';
import { JarvisCard } from '@/components/ui/JarvisCard';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Button } from '@/components/ui/button';
import { 
  getCurrentMonthGoal, 
  calculateWorkingDaysRemaining, 
  calculateDailyGoal,
  getTemplates,
  getDiscounts
} from '@/lib/storage';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Array<{ id: string; type: 'info' | 'warning' | 'success' | 'error'; title: string; message: string }>>([]);
  const [stats, setStats] = useState({
    meta1: 0,
    meta2: 0,
    meta3: 0,
    achieved: 0,
    dailyGoal: 0,
    workingDays: 0,
    templatesCount: 0,
    discountsCount: 0,
  });

  useEffect(() => {
    const goal = getCurrentMonthGoal();
    const workingDays = calculateWorkingDaysRemaining();
    const templates = getTemplates();
    const discountsList = getDiscounts();

    if (goal) {
      setStats({
        meta1: goal.meta1,
        meta2: goal.meta2,
        meta3: goal.meta3,
        achieved: goal.achieved,
        dailyGoal: calculateDailyGoal(goal.meta3, goal.achieved),
        workingDays,
        templatesCount: templates.length,
      });

      const newAlerts = [];
      if (goal.achieved < goal.meta3 * 0.5 && workingDays < 10) {
        newAlerts.push({
          id: '1',
          type: 'warning' as const,
          title: 'Meta em risco!',
          message: `Você precisa fechar R$ ${calculateDailyGoal(goal.meta3, goal.achieved).toLocaleString('pt-BR')} por dia para bater a Meta 3.`,
        });
      }
      setAlerts(newAlerts);
    } else {
      setStats({
        meta1: 0, meta2: 0, meta3: 0, achieved: 0,
        dailyGoal: 0, workingDays, templatesCount: templates.length,
      });
      setAlerts([{
        id: '0',
        type: 'info' as const,
        title: 'Configure suas metas',
        message: 'Defina suas metas mensais para acompanhar seu progresso.',
      }]);
    }
  }, []);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const progressMeta3 = stats.meta3 > 0 ? (stats.achieved / stats.meta3) * 100 : 0;
  const projection = stats.workingDays > 0 && stats.achieved > 0
    ? Math.round(stats.achieved / (new Date().getDate()) * 30)
    : 0;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="triade-symbol text-primary text-sm">✦</span>
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Painel de Comando</span>
              </div>
              <h1 className="text-4xl font-display font-bold tracking-tight text-foreground mb-2">
                Central de <span className="gradient-text">Operações</span>
              </h1>
              <p className="text-muted-foreground max-w-md">
                Monitore suas metas, gerencie estratégias e feche negócios com precisão.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/jarvis')}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              <Bot className="h-4 w-4" />
              Falar com Jarvis
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-3">
            {alerts.map(alert => (
              <AlertBanner
                key={alert.id}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                onDismiss={() => dismissAlert(alert.id)}
              />
            ))}
          </div>
        )}

        {/* Key Metrics - 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Meta Diária"
            value={`R$ ${stats.dailyGoal.toLocaleString('pt-BR')}`}
            subtitle={`${stats.workingDays} dias úteis restantes`}
            icon={<Target className="h-5 w-5" />}
            trend="neutral"
          />
          <StatCard
            title="Já Fechado"
            value={`R$ ${stats.achieved.toLocaleString('pt-BR')}`}
            subtitle={`${progressMeta3.toFixed(0)}% da Meta 3`}
            icon={<TrendingUp className="h-5 w-5" />}
            trend={progressMeta3 >= 100 ? 'up' : progressMeta3 >= 50 ? 'neutral' : 'down'}
          />
          <StatCard
            title="Projeção do Mês"
            value={`R$ ${projection.toLocaleString('pt-BR')}`}
            subtitle={projection >= stats.meta3 ? 'Acima da meta' : 'Abaixo da meta'}
            icon={<Activity className="h-5 w-5" />}
            trend={projection >= stats.meta3 ? 'up' : 'down'}
          />
          <StatCard
            title="Performance"
            value={`${progressMeta3.toFixed(1)}%`}
            subtitle={`Meta 3: R$ ${stats.meta3.toLocaleString('pt-BR')}`}
            icon={<ArrowUpRight className="h-5 w-5" />}
            trend={progressMeta3 >= 80 ? 'up' : progressMeta3 >= 50 ? 'neutral' : 'down'}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meta Progress */}
          <JarvisCard 
            className="lg:col-span-2"
            title="Progresso das Metas"
            icon={<Target className="h-5 w-5" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Meta 1', value: stats.meta1, colorClass: 'text-primary', barClass: 'bg-primary' },
                { label: 'Meta 2', value: stats.meta2, colorClass: 'text-success', barClass: 'bg-success' },
                { label: 'Meta 3', value: stats.meta3, colorClass: 'text-warning', barClass: 'bg-warning' },
              ].map((meta) => {
                const progress = meta.value > 0 ? Math.min((stats.achieved / meta.value) * 100, 100) : 0;
                const remaining = Math.max(meta.value - stats.achieved, 0);
                const daily = stats.workingDays > 0 && remaining > 0 ? Math.ceil(remaining / stats.workingDays) : 0;
                
                return (
                  <div key={meta.label} className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-sm">{meta.label}</h4>
                      <span className={`text-2xl font-bold font-mono ${meta.colorClass}`}>
                        {progress.toFixed(0)}%
                      </span>
                    </div>

                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${meta.barClass} rounded-full transition-all duration-700 ${progress > 0 ? 'progress-glow' : ''}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Meta</p>
                        <p className="font-mono font-semibold">R$ {meta.value.toLocaleString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Falta</p>
                        <p className="font-mono font-semibold">R$ {remaining.toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-border">
                        <p className="text-muted-foreground">Por dia</p>
                        <p className="font-mono font-semibold text-base">
                          R$ {daily.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </JarvisCard>

          {/* Quick Actions */}
          <JarvisCard
            title="Ações Rápidas"
            icon={<Zap className="h-5 w-5" />}
          >
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 border-border hover:border-primary/30 hover:bg-primary/5 transition-all"
                onClick={() => navigate('/descontos')}
              >
                <Zap className="h-4 w-4 text-primary" />
                Pegar Cupom
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 border-border hover:border-primary/30 hover:bg-primary/5 transition-all"
                onClick={() => navigate('/templates')}
              >
                <Calendar className="h-4 w-4 text-primary" />
                Copiar Template
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 border-border hover:border-primary/30 hover:bg-primary/5 transition-all"
                onClick={() => navigate('/metas')}
              >
                <Target className="h-4 w-4 text-primary" />
                Atualizar Meta
              </Button>
            </div>
          </JarvisCard>
        </div>
      </div>
    </MainLayout>
  );
}
