import { useState, useEffect } from 'react';
import { Target, Calendar, TrendingUp, Calculator } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { JarvisCard } from '@/components/ui/JarvisCard';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  getCurrentMonthGoal, 
  saveGoal, 
  updateGoal,
  calculateWorkingDaysRemaining,
  calculateDailyGoal,
  Goal
} from '@/lib/storage';

export default function Metas() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [workingDays, setWorkingDays] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    meta1: '',
    meta2: '',
    meta3: '',
    achieved: '',
    customWorkingDays: '',
  });

  useEffect(() => {
    const currentGoal = getCurrentMonthGoal();
    const days = calculateWorkingDaysRemaining();
    
    setGoal(currentGoal);
    setWorkingDays(days);
    
    if (currentGoal) {
      setFormData({
        meta1: currentGoal.meta1.toString(),
        meta2: currentGoal.meta2.toString(),
        meta3: currentGoal.meta3.toString(),
        achieved: currentGoal.achieved.toString(),
        customWorkingDays: currentGoal.customWorkingDays?.toString() || '',
      });
    }
  }, []);

  const handleSave = () => {
    const now = new Date();
    const customDays = formData.customWorkingDays ? parseInt(formData.customWorkingDays) : undefined;
    const newGoal = {
      month: now.getMonth(),
      year: now.getFullYear(),
      meta1: parseFloat(formData.meta1) || 0,
      meta2: parseFloat(formData.meta2) || 0,
      meta3: parseFloat(formData.meta3) || 0,
      achieved: parseFloat(formData.achieved) || 0,
      customWorkingDays: customDays && customDays > 0 ? customDays : undefined,
    };

    if (goal) {
      updateGoal(goal.id, newGoal);
      setGoal({ ...goal, ...newGoal });
    } else {
      const saved = saveGoal(newGoal);
      setGoal(saved);
    }

    setIsEditing(false);
    toast.success('Metas atualizadas!');
  };

  const handleUpdateAchieved = () => {
    if (!goal) return;
    
    const achieved = parseFloat(formData.achieved) || 0;
    updateGoal(goal.id, { achieved });
    setGoal({ ...goal, achieved });
    toast.success('Valor atualizado!');
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const now = new Date();
  const currentMonthName = monthNames[now.getMonth()];

  const meta1 = goal?.meta1 || 0;
  const meta2 = goal?.meta2 || 0;
  const meta3 = goal?.meta3 || 0;
  const achieved = goal?.achieved || 0;

  const dailyMeta1 = calculateDailyGoal(meta1, achieved);
  const dailyMeta2 = calculateDailyGoal(meta2, achieved);
  const dailyMeta3 = calculateDailyGoal(meta3, achieved);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="gradient-text">Metas de {currentMonthName}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe seu progresso e saiba exatamente quanto precisa fechar
            </p>
          </div>
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Target className="h-4 w-4" />
              {goal ? 'Editar Metas' : 'Definir Metas'}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                Salvar
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Dias Úteis Restantes"
            value={workingDays}
            subtitle={`Até ${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}/${now.getMonth() + 1}`}
            icon={<Calendar className="h-5 w-5" />}
          />
          <StatCard
            title="Meta Diária p/ Meta 1"
            value={`R$ ${dailyMeta1.toLocaleString('pt-BR')}`}
            subtitle={dailyMeta1 > 0 ? 'Necessário por dia' : 'Meta batida!'}
            icon={<Target className="h-5 w-5" />}
            trend={dailyMeta1 === 0 ? 'up' : 'neutral'}
          />
          <StatCard
            title="Meta Diária p/ Meta 2"
            value={`R$ ${dailyMeta2.toLocaleString('pt-BR')}`}
            subtitle={dailyMeta2 > 0 ? 'Necessário por dia' : 'Meta batida!'}
            icon={<Target className="h-5 w-5" />}
            trend={dailyMeta2 === 0 ? 'up' : 'neutral'}
          />
          <StatCard
            title="Meta Diária p/ Meta 3"
            value={`R$ ${dailyMeta3.toLocaleString('pt-BR')}`}
            subtitle={dailyMeta3 > 0 ? 'Necessário por dia' : 'Meta batida!'}
            icon={<Target className="h-5 w-5" />}
            trend={dailyMeta3 === 0 ? 'up' : 'neutral'}
          />
        </div>

        {/* Goals Form / Display */}
        {isEditing ? (
          <JarvisCard title="Configurar Metas" icon={<Calculator className="h-5 w-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label>Meta 1 (R$)</Label>
                <Input
                  type="number"
                  value={formData.meta1}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta1: e.target.value }))}
                  placeholder="10000"
                  className="bg-input border-border font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Meta 2 (R$)</Label>
                <Input
                  type="number"
                  value={formData.meta2}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta2: e.target.value }))}
                  placeholder="15000"
                  className="bg-input border-border font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Meta 3 (R$)</Label>
                <Input
                  type="number"
                  value={formData.meta3}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta3: e.target.value }))}
                  placeholder="20000"
                  className="bg-input border-border font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Já Fechado (R$)</Label>
                <Input
                  type="number"
                  value={formData.achieved}
                  onChange={(e) => setFormData(prev => ({ ...prev, achieved: e.target.value }))}
                  placeholder="5000"
                  className="bg-input border-border font-mono"
                />
              </div>
            </div>
          </JarvisCard>
        ) : (
          <>
            {/* Quick Update */}
            <JarvisCard title="Atualizar Valor Fechado" icon={<TrendingUp className="h-5 w-5" />}>
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Quanto você já fechou este mês? (R$)</Label>
                  <Input
                    type="number"
                    value={formData.achieved}
                    onChange={(e) => setFormData(prev => ({ ...prev, achieved: e.target.value }))}
                    className="bg-input border-border font-mono text-lg"
                  />
                </div>
                <Button onClick={handleUpdateAchieved} className="bg-primary hover:bg-primary/90">
                  Atualizar
                </Button>
              </div>
            </JarvisCard>

            {/* Progress Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[
                { label: 'Meta 1', value: meta1, color: 'primary' },
                { label: 'Meta 2', value: meta2, color: 'success' },
                { label: 'Meta 3', value: meta3, color: 'warning' },
              ].map((meta) => {
                const progress = meta.value > 0 ? Math.min((achieved / meta.value) * 100, 100) : 0;
                const remaining = Math.max(meta.value - achieved, 0);
                const daily = calculateDailyGoal(meta.value, achieved);

                return (
                  <JarvisCard key={meta.label} className="jarvis-border" glow={progress >= 100}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg">{meta.label}</h3>
                        <span className={`text-2xl font-bold font-mono ${
                          meta.color === 'primary' ? 'text-primary' : 
                          meta.color === 'success' ? 'text-success' : 'text-warning'
                        }`}>
                          {progress.toFixed(0)}%
                        </span>
                      </div>

                      <div className="h-4 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            meta.color === 'primary' ? 'bg-primary' : 
                            meta.color === 'success' ? 'bg-success' : 'bg-warning'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
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
                          <p className="font-mono font-semibold text-lg">
                            R$ {daily.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </JarvisCard>
                );
              })}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
