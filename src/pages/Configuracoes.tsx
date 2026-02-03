import { useState, useEffect } from 'react';
import { 
  Bell, 
  Bot, 
  Plus, 
  Trash2, 
  Settings,
  AlertTriangle,
  Target,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { JarvisCard } from '@/components/ui/JarvisCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  getSmartAlerts, 
  saveSmartAlerts, 
  getJarvisConfig, 
  saveJarvisConfig,
  type SmartAlert,
  type JarvisConfig,
  type JarvisMode
} from '@/lib/storage';
import { cn } from '@/lib/utils';

const JARVIS_MODES: { id: JarvisMode; label: string; description: string; icon: React.ReactNode }[] = [
  { 
    id: 'closer', 
    label: 'Closer', 
    description: 'Direto, confiante, orientado a fechamento',
    icon: <Target className="h-5 w-5" />
  },
  { 
    id: 'lider', 
    label: 'Líder', 
    description: 'Firme, exigente, mas motivador',
    icon: <Users className="h-5 w-5" />
  },
  { 
    id: 'gestor', 
    label: 'Gestor', 
    description: 'Analítico, estratégico, focado em métricas',
    icon: <TrendingUp className="h-5 w-5" />
  },
  { 
    id: 'auditor', 
    label: 'Auditor', 
    description: 'Crítico, detalhista, revisão de conversas',
    icon: <AlertTriangle className="h-5 w-5" />
  },
  { 
    id: 'estrategista', 
    label: 'Estrategista', 
    description: 'Consultivo, visionário, planejamento',
    icon: <Settings className="h-5 w-5" />
  },
];

const ALERT_TRIGGERS = [
  'Nenhum follow-up feito no dia',
  'Meta diária abaixo do necessário',
  'Leads quentes sem retorno há 24h',
  'Negociação aberta há mais de 7 dias',
  'Desconto solicitado sem contrapartida',
  'Lead esfriou após proposta',
  'Outro (personalizado)',
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baixa', color: 'bg-muted text-muted-foreground' },
  { value: 'medium', label: 'Média', color: 'bg-warning/20 text-warning' },
  { value: 'high', label: 'Alta', color: 'bg-destructive/20 text-destructive' },
];

export default function Configuracoes() {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [config, setConfig] = useState<JarvisConfig>({
    activeMode: 'closer',
    autoModeSwitch: false,
    principles: [],
  });
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [newAlert, setNewAlert] = useState<Partial<SmartAlert>>({
    trigger: '',
    suggestedAction: '',
    priority: 'medium',
    isActive: true,
  });

  useEffect(() => {
    setAlerts(getSmartAlerts());
    setConfig(getJarvisConfig());
  }, []);

  const handleModeChange = (mode: JarvisMode) => {
    const updated = { ...config, activeMode: mode };
    setConfig(updated);
    saveJarvisConfig(updated);
    toast.success(`Modo ${JARVIS_MODES.find(m => m.id === mode)?.label} ativado`);
  };

  const handleAutoModeSwitchChange = (checked: boolean) => {
    const updated = { ...config, autoModeSwitch: checked };
    setConfig(updated);
    saveJarvisConfig(updated);
    toast.success(checked ? 'Troca automática de modo ativada' : 'Troca automática desativada');
  };

  const handleAddAlert = () => {
    if (!newAlert.trigger || !newAlert.suggestedAction) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const alert: SmartAlert = {
      id: Date.now().toString(),
      trigger: newAlert.trigger,
      suggestedAction: newAlert.suggestedAction,
      priority: newAlert.priority as 'low' | 'medium' | 'high',
      isActive: true,
    };

    const updated = [...alerts, alert];
    setAlerts(updated);
    saveSmartAlerts(updated);
    setNewAlert({ trigger: '', suggestedAction: '', priority: 'medium', isActive: true });
    setIsAlertDialogOpen(false);
    toast.success('Alerta inteligente criado');
  };

  const handleToggleAlert = (id: string) => {
    const updated = alerts.map(a => 
      a.id === id ? { ...a, isActive: !a.isActive } : a
    );
    setAlerts(updated);
    saveSmartAlerts(updated);
  };

  const handleDeleteAlert = (id: string) => {
    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated);
    saveSmartAlerts(updated);
    toast.success('Alerta removido');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Configurações</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie alertas inteligentes e modos do Jarvis
          </p>
        </div>

        {/* Jarvis Modes */}
        <JarvisCard
          title="Modos do Jarvis"
          icon={<Bot className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecione como o Jarvis deve se comportar nas suas interações
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {JARVIS_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleModeChange(mode.id)}
                  className={cn(
                    'p-4 rounded-lg border transition-all text-left',
                    'hover:border-primary/50',
                    config.activeMode === mode.id
                      ? 'border-primary bg-primary/10 jarvis-border'
                      : 'border-border bg-card'
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                      'p-2 rounded-lg',
                      config.activeMode === mode.id ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    )}>
                      {mode.icon}
                    </div>
                    <span className={cn(
                      'font-semibold',
                      config.activeMode === mode.id && 'text-primary'
                    )}>
                      {mode.label}
                    </span>
                    {config.activeMode === mode.id && (
                      <Badge variant="default" className="ml-auto">Ativo</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {mode.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <p className="font-medium">Troca automática de modo</p>
                <p className="text-sm text-muted-foreground">
                  Jarvis alterna o modo conforme o contexto da conversa
                </p>
              </div>
              <Switch
                checked={config.autoModeSwitch}
                onCheckedChange={handleAutoModeSwitchChange}
              />
            </div>
          </div>
        </JarvisCard>

        {/* Smart Alerts */}
        <JarvisCard
          title="Alertas Inteligentes"
          icon={<Bell className="h-5 w-5" />}
          action={
            <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Alerta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Alerta Inteligente</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Gatilho do Alerta</Label>
                    <Select
                      value={newAlert.trigger}
                      onValueChange={(v) => setNewAlert({ ...newAlert, trigger: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o gatilho" />
                      </SelectTrigger>
                      <SelectContent>
                        {ALERT_TRIGGERS.map((trigger) => (
                          <SelectItem key={trigger} value={trigger}>
                            {trigger}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {newAlert.trigger === 'Outro (personalizado)' && (
                    <div className="space-y-2">
                      <Label>Gatilho Personalizado</Label>
                      <Input
                        placeholder="Descreva o gatilho..."
                        onChange={(e) => setNewAlert({ ...newAlert, trigger: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Ação Sugerida</Label>
                    <Textarea
                      placeholder="O que o Jarvis deve sugerir quando esse alerta disparar?"
                      value={newAlert.suggestedAction}
                      onChange={(e) => setNewAlert({ ...newAlert, suggestedAction: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select
                      value={newAlert.priority}
                      onValueChange={(v) => setNewAlert({ ...newAlert, priority: v as 'low' | 'medium' | 'high' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleAddAlert} className="w-full">
                    Criar Alerta
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        >
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum alerta configurado</p>
                <p className="text-sm">Crie alertas para o Jarvis te avisar automaticamente</p>
              </div>
            ) : (
              alerts.map((alert) => {
                const priorityConfig = PRIORITY_OPTIONS.find(p => p.value === alert.priority);
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      'p-4 rounded-lg border transition-all',
                      alert.isActive ? 'bg-card border-border' : 'bg-muted/50 border-muted opacity-60'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{alert.trigger}</span>
                          <Badge className={priorityConfig?.color}>
                            {priorityConfig?.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {alert.suggestedAction}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={alert.isActive}
                          onCheckedChange={() => handleToggleAlert(alert.id)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </JarvisCard>

        {/* Principles Section */}
        <JarvisCard
          title="Princípios Inegociáveis"
          icon={<Target className="h-5 w-5" />}
        >
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Estes princípios guiam todas as respostas do Jarvis
            </p>
            {[
              'Valor antes de preço - SEMPRE',
              'Nunca implorar fechamento',
              'Nunca dar desconto sem contrapartida',
              'Sempre conduzir para próximo passo',
              'Testar compromisso antes de avançar',
            ].map((principle, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {index + 1}
                </div>
                <span className="text-sm font-medium">{principle}</span>
              </div>
            ))}
          </div>
        </JarvisCard>
      </div>
    </MainLayout>
  );
}
