import { useEffect, useState } from 'react';
import { 
  Target, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  Bot,
  Zap
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
  getTemplates
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
  });

  useEffect(() => {
    const goal = getCurrentMonthGoal();
    const workingDays = calculateWorkingDaysRemaining();
    const templates = getTemplates();

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

      // Generate smart alerts
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
        meta1: 0,
        meta2: 0,
        meta3: 0,
        achieved: 0,
        dailyGoal: 0,
        workingDays,
        templatesCount: templates.length,
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Seu centro de comando de vendas
            </p>
          </div>
          <Button 
            onClick={() => navigate('/jarvis')}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Bot className="h-4 w-4" />
            Falar com Jarvis
          </Button>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Meta Diária Necessária"
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
            title="Templates Prontos"
            value={stats.templatesCount}
            subtitle="Mensagens copiáveis"
            icon={<Calendar className="h-5 w-5" />}
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
            <div className="space-y-6">
              {[
                { label: 'Meta 1', value: stats.meta1, color: 'bg-primary' },
                { label: 'Meta 2', value: stats.meta2, color: 'bg-success' },
                { label: 'Meta 3', value: stats.meta3, color: 'bg-warning' },
              ].map((meta) => {
                const progress = meta.value > 0 ? Math.min((stats.achieved / meta.value) * 100, 100) : 0;
                const remaining = Math.max(meta.value - stats.achieved, 0);
                
                return (
                  <div key={meta.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{meta.label}</span>
                      <span className="font-mono text-muted-foreground">
                        R$ {stats.achieved.toLocaleString('pt-BR')} / R$ {meta.value.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${meta.color} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{progress.toFixed(1)}% concluído</span>
                      <span>Falta: R$ {remaining.toLocaleString('pt-BR')}</span>
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
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 jarvis-border"
                onClick={() => navigate('/descontos')}
              >
                <Zap className="h-4 w-4 text-primary" />
                Pegar Cupom
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 jarvis-border"
                onClick={() => navigate('/templates')}
              >
                <Calendar className="h-4 w-4 text-primary" />
                Copiar Template
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 jarvis-border"
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
