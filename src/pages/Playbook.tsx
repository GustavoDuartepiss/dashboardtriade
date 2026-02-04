import { useState, useRef, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JarvisCard } from '@/components/ui/JarvisCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Brain, 
  Shield, 
  Target, 
  MessageSquare, 
  TrendingUp, 
  DollarSign,
  Plus,
  Trash2,
  Download,
  Upload,
  Undo2
} from 'lucide-react';
import {
  Objection,
  ClosingRule,
  Plan,
  FollowUpScenario,
  LeadScoreRule,
  LeadScoreConfig,
  OTEConfig,
  getObjections,
  saveObjection,
  deleteObjection,
  restoreObjection,
  getClosingRules,
  saveClosingRule,
  deleteClosingRule,
  restoreClosingRule,
  getPlans,
  savePlan,
  deletePlan,
  restorePlan,
  getFollowUpScenarios,
  saveFollowUpScenario,
  deleteFollowUpScenario,
  restoreFollowUpScenario,
  getLeadScoreRules,
  saveLeadScoreRule,
  deleteLeadScoreRule,
  restoreLeadScoreRule,
  getLeadScoreConfig,
  saveLeadScoreConfig,
  getOTEConfig,
  saveOTEConfig,
  updateOTEConfig,
  exportPlaybook,
  importPlaybook,
  PlaybookExport,
} from '@/lib/storage';

// Tipos para undo
type UndoableItem = Objection | ClosingRule | Plan | FollowUpScenario | LeadScoreRule;
type UndoType = 'objection' | 'closingRule' | 'plan' | 'followUpScenario' | 'leadScoreRule';

interface UndoAction {
  type: UndoType;
  item: UndoableItem;
}

export default function Playbook() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado para cada seção
  const [objections, setObjections] = useState<Objection[]>(getObjections());
  const [closingRules, setClosingRules] = useState<ClosingRule[]>(getClosingRules());
  const [plans, setPlans] = useState<Plan[]>(getPlans());
  const [followUpScenarios, setFollowUpScenarios] = useState<FollowUpScenario[]>(getFollowUpScenarios());
  const [leadScoreRules, setLeadScoreRules] = useState<LeadScoreRule[]>(getLeadScoreRules());
  const [leadScoreConfig, setLeadScoreConfigState] = useState<LeadScoreConfig>(getLeadScoreConfig());
  const [oteConfig, setOteConfigState] = useState<OTEConfig | null>(getOTEConfig());

  // Forms state
  const [showObjectionForm, setShowObjectionForm] = useState(false);
  const [showClosingRuleForm, setShowClosingRuleForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [showScoreRuleForm, setShowScoreRuleForm] = useState(false);

  // Handle Export
  const handleExport = () => {
    const data = exportPlaybook();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `playbook-jarvis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Playbook exportado!', description: 'Arquivo JSON baixado com sucesso.' });
  };

  // Handle Import
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as PlaybookExport;
        importPlaybook(data);
        // Refresh all states
        setObjections(getObjections());
        setClosingRules(getClosingRules());
        setPlans(getPlans());
        setFollowUpScenarios(getFollowUpScenarios());
        setLeadScoreRules(getLeadScoreRules());
        setLeadScoreConfigState(getLeadScoreConfig());
        setOteConfigState(getOTEConfig());
        toast({ title: 'Playbook importado!', description: 'Todos os dados foram atualizados.' });
      } catch {
        toast({ title: 'Erro na importação', description: 'Arquivo JSON inválido.', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Objection handlers
  const handleAddObjection = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    saveObjection({
      objection: formData.get('objection') as string,
      context: formData.get('context') as string,
      realIntent: formData.get('realIntent') as string,
      strategy: formData.get('strategy') as string,
      bestResponse: formData.get('bestResponse') as string,
      closerNotes: formData.get('closerNotes') as string,
      variations: [],
      useDiscount: false,
      notes: '',
    });
    
    setObjections(getObjections());
    setShowObjectionForm(false);
    form.reset();
    toast({ title: 'Objeção cadastrada!' });
  };

  // Closing Rule handlers
  const handleAddClosingRule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    saveClosingRule({
      situation: formData.get('situation') as string,
      recommendedAction: formData.get('recommendedAction') as string,
      prohibitedAction: formData.get('prohibitedAction') as string,
      strategicReason: formData.get('strategicReason') as string,
      ruleType: formData.get('ruleType') as ClosingRule['ruleType'],
    });
    
    setClosingRules(getClosingRules());
    setShowClosingRuleForm(false);
    form.reset();
    toast({ title: 'Regra de fechamento cadastrada!' });
  };

  // Plan handlers
  const handleAddPlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    savePlan({
      name: formData.get('name') as string,
      type: formData.get('type') as Plan['type'],
      fullPrice: Number(formData.get('fullPrice')),
      promoPrice: formData.get('promoPrice') ? Number(formData.get('promoPrice')) : null,
      discountRules: formData.get('discountRules') as string,
      whenToOffer: formData.get('whenToOffer') as string,
      whenNotToOffer: formData.get('whenNotToOffer') as string,
    });
    
    setPlans(getPlans());
    setShowPlanForm(false);
    form.reset();
    toast({ title: 'Plano cadastrado!' });
  };

  // Follow-up Scenario handlers
  const handleAddFollowUpScenario = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    saveFollowUpScenario({
      scenario: formData.get('scenario') as string,
      channel: formData.get('channel') as FollowUpScenario['channel'],
      suggestedMessage: formData.get('suggestedMessage') as string,
      attempts: Number(formData.get('attempts')),
      intervalDays: Number(formData.get('intervalDays')),
    });
    
    setFollowUpScenarios(getFollowUpScenarios());
    setShowFollowUpForm(false);
    form.reset();
    toast({ title: 'Cenário de follow-up cadastrado!' });
  };

  // Lead Score Rule handlers
  const handleAddScoreRule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    saveLeadScoreRule({
      type: formData.get('type') as LeadScoreRule['type'],
      criteria: formData.get('criteria') as string,
      points: Number(formData.get('points')),
    });
    
    setLeadScoreRules(getLeadScoreRules());
    setShowScoreRuleForm(false);
    form.reset();
    toast({ title: 'Regra de score cadastrada!' });
  };

  // Lead Score Config handlers
  const handleSaveScoreConfig = () => {
    saveLeadScoreConfig(leadScoreConfig);
    toast({ title: 'Configuração de score salva!' });
  };

  // OTE Config handlers
  const handleSaveOTE = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const config: Omit<OTEConfig, 'id' | 'createdAt'> = {
      monthlyGoal: Number(formData.get('monthlyGoal')),
      baseCommission: Number(formData.get('baseCommission')),
      accelerators: oteConfig?.accelerators || [],
      penalties: oteConfig?.penalties || [],
      calculationRules: formData.get('calculationRules') as string,
      jarvisGuidance: formData.get('jarvisGuidance') as string,
    };
    
    if (oteConfig) {
      updateOTEConfig(config);
    } else {
      saveOTEConfig(config);
    }
    
    setOteConfigState(getOTEConfig());
    toast({ title: 'Configuração OTE salva!' });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="h-7 w-7 text-primary" />
              Central de Inteligência
            </h1>
            <p className="text-muted-foreground mt-1">
              Playbook estratégico do Jarvis — base de conhecimento para decisões de vendas
            </p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Importar JSON
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Playbook
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="objecoes" className="space-y-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2 h-auto p-1">
            <TabsTrigger value="objecoes" className="flex items-center gap-2 py-2">
              <Shield className="h-4 w-4" />
              <span className="hidden md:inline">Objeções</span>
            </TabsTrigger>
            <TabsTrigger value="fechamento" className="flex items-center gap-2 py-2">
              <Target className="h-4 w-4" />
              <span className="hidden md:inline">Fechamento</span>
            </TabsTrigger>
            <TabsTrigger value="planos" className="flex items-center gap-2 py-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden md:inline">Planos</span>
            </TabsTrigger>
            <TabsTrigger value="followups" className="flex items-center gap-2 py-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden md:inline">Follow-ups</span>
            </TabsTrigger>
            <TabsTrigger value="score" className="flex items-center gap-2 py-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden md:inline">Score</span>
            </TabsTrigger>
            <TabsTrigger value="ote" className="flex items-center gap-2 py-2">
              <Zap className="h-4 w-4" />
              <span className="hidden md:inline">OTE</span>
            </TabsTrigger>
          </TabsList>

          {/* OBJEÇÕES */}
          <TabsContent value="objecoes" className="space-y-4">
            <JarvisCard 
              title="Matriz de Objeções" 
              description="Unidades de decisão para cada objeção do lead"
              icon={<Shield className="h-5 w-5 text-primary" />}
            >
              {showObjectionForm ? (
                <form onSubmit={handleAddObjection} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="objection">O que o lead fala</Label>
                      <Input id="objection" name="objection" placeholder="Ex: Está muito caro" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="context">Momento do funil</Label>
                      <Select name="context" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o momento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apresentacao">Apresentação</SelectItem>
                          <SelectItem value="negociacao">Negociação</SelectItem>
                          <SelectItem value="follow-up">Follow-up</SelectItem>
                          <SelectItem value="fechamento">Fechamento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="realIntent">Intenção real do lead</Label>
                      <Input id="realIntent" name="realIntent" placeholder="O que ele realmente quer dizer com isso" required />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="strategy">Estratégia recomendada</Label>
                      <Textarea id="strategy" name="strategy" placeholder="Como abordar essa objeção" required />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bestResponse">Discurso sugerido</Label>
                      <Textarea id="bestResponse" name="bestResponse" placeholder="Resposta modelo para usar" required />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="closerNotes">Observações do closer</Label>
                      <Textarea id="closerNotes" name="closerNotes" placeholder="Notas internas e dicas" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Salvar Objeção</Button>
                    <Button type="button" variant="outline" onClick={() => setShowObjectionForm(false)}>Cancelar</Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <Button onClick={() => setShowObjectionForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Objeção
                  </Button>
                  <div className="space-y-3">
                    {objections.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Nenhuma objeção cadastrada</p>
                    ) : (
                      objections.map((obj) => (
                        <div key={obj.id} className="jarvis-glass p-4 rounded-lg space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">"{obj.objection}"</p>
                              <Badge variant="outline" className="mt-1">{obj.context}</Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                deleteObjection(obj.id);
                                setObjections(getObjections());
                                toast({ title: 'Objeção removida' });
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p><strong>Intenção real:</strong> {obj.realIntent}</p>
                            <p><strong>Estratégia:</strong> {obj.strategy}</p>
                          </div>
                          <div className="text-sm bg-primary/10 p-2 rounded">
                            <strong>Resposta:</strong> {obj.bestResponse}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </JarvisCard>
          </TabsContent>

          {/* FECHAMENTO */}
          <TabsContent value="fechamento" className="space-y-4">
            <JarvisCard 
              title="Regras de Fechamento" 
              description="Quando avançar, segurar ou encerrar uma negociação"
              icon={<Target className="h-5 w-5 text-primary" />}
            >
              {showClosingRuleForm ? (
                <form onSubmit={handleAddClosingRule} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ruleType">Tipo de Regra</Label>
                      <Select name="ruleType" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="avancar">✅ Avançar para fechamento</SelectItem>
                          <SelectItem value="segurar">⏸️ Segurar o lead</SelectItem>
                          <SelectItem value="encerrar">🛑 Encerrar a conversa</SelectItem>
                          <SelectItem value="testar-compromisso">🎯 Testar compromisso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="situation">Situação</Label>
                      <Textarea id="situation" name="situation" placeholder="Descreva a situação" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recommendedAction">✅ Ação Recomendada</Label>
                      <Textarea id="recommendedAction" name="recommendedAction" placeholder="O que fazer" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prohibitedAction">❌ Ação Proibida</Label>
                      <Textarea id="prohibitedAction" name="prohibitedAction" placeholder="O que NÃO fazer" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="strategicReason">💡 Justificativa Estratégica</Label>
                      <Textarea id="strategicReason" name="strategicReason" placeholder="Por que essa regra funciona" required />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Salvar Regra</Button>
                    <Button type="button" variant="outline" onClick={() => setShowClosingRuleForm(false)}>Cancelar</Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <Button onClick={() => setShowClosingRuleForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Regra
                  </Button>
                  <div className="space-y-3">
                    {closingRules.map((rule) => (
                      <div key={rule.id} className="jarvis-glass p-4 rounded-lg space-y-2">
                        <div className="flex items-start justify-between">
                          <Badge variant={
                            rule.ruleType === 'avancar' ? 'default' :
                            rule.ruleType === 'encerrar' ? 'destructive' : 'secondary'
                          }>
                            {rule.ruleType === 'avancar' && '✅ Avançar'}
                            {rule.ruleType === 'segurar' && '⏸️ Segurar'}
                            {rule.ruleType === 'encerrar' && '🛑 Encerrar'}
                            {rule.ruleType === 'testar-compromisso' && '🎯 Testar'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              deleteClosingRule(rule.id);
                              setClosingRules(getClosingRules());
                              toast({ title: 'Regra removida' });
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <p className="font-medium">{rule.situation}</p>
                        <div className="text-sm space-y-1">
                          <p className="text-green-400">✅ {rule.recommendedAction}</p>
                          <p className="text-red-400">❌ {rule.prohibitedAction}</p>
                          <p className="text-muted-foreground">💡 {rule.strategicReason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </JarvisCard>
          </TabsContent>

          {/* PLANOS */}
          <TabsContent value="planos" className="space-y-4">
            <JarvisCard 
              title="Valores e Planos" 
              description="Tabela de preços e regras de oferta"
              icon={<DollarSign className="h-5 w-5 text-primary" />}
            >
              {showPlanForm ? (
                <form onSubmit={handleAddPlan} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Plano</Label>
                      <Input id="name" name="name" placeholder="Ex: Premium Anual" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo</Label>
                      <Select name="type" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mensal">Mensal</SelectItem>
                          <SelectItem value="trimestral">Trimestral</SelectItem>
                          <SelectItem value="semestral">Semestral</SelectItem>
                          <SelectItem value="anual">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullPrice">Valor Cheio (R$)</Label>
                      <Input id="fullPrice" name="fullPrice" type="number" step="0.01" placeholder="1997.00" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="promoPrice">Valor Promocional (R$)</Label>
                      <Input id="promoPrice" name="promoPrice" type="number" step="0.01" placeholder="Opcional" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="discountRules">Regras de Desconto</Label>
                      <Textarea id="discountRules" name="discountRules" placeholder="Quando e como aplicar descontos" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whenToOffer">Quando Ofertar</Label>
                      <Textarea id="whenToOffer" name="whenToOffer" placeholder="Situações ideais para oferecer" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whenNotToOffer">Quando NÃO Ofertar</Label>
                      <Textarea id="whenNotToOffer" name="whenNotToOffer" placeholder="Situações para evitar" required />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Salvar Plano</Button>
                    <Button type="button" variant="outline" onClick={() => setShowPlanForm(false)}>Cancelar</Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <Button onClick={() => setShowPlanForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Plano
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plans.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8 md:col-span-2">Nenhum plano cadastrado</p>
                    ) : (
                      plans.map((plan) => (
                        <div key={plan.id} className="jarvis-glass p-4 rounded-lg space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{plan.name}</p>
                              <Badge variant="outline">{plan.type}</Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                deletePlan(plan.id);
                                setPlans(getPlans());
                                toast({ title: 'Plano removido' });
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-primary">
                              R$ {plan.promoPrice?.toLocaleString('pt-BR') || plan.fullPrice.toLocaleString('pt-BR')}
                            </span>
                            {plan.promoPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                R$ {plan.fullPrice.toLocaleString('pt-BR')}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p><strong>Regras:</strong> {plan.discountRules}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </JarvisCard>
          </TabsContent>

          {/* FOLLOW-UPS */}
          <TabsContent value="followups" className="space-y-4">
            <JarvisCard 
              title="Cenários de Follow-up" 
              description="Estratégias por situação e canal"
              icon={<MessageSquare className="h-5 w-5 text-primary" />}
            >
              {showFollowUpForm ? (
                <form onSubmit={handleAddFollowUpScenario} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="scenario">Cenário do Lead</Label>
                      <Input id="scenario" name="scenario" placeholder="Ex: Lead viu proposta mas não respondeu" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="channel">Canal</Label>
                      <Select name="channel" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o canal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="ligacao">Ligação</SelectItem>
                          <SelectItem value="email">E-mail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="attempts">Tentativas</Label>
                      <Input id="attempts" name="attempts" type="number" min="1" placeholder="3" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="intervalDays">Intervalo (dias)</Label>
                      <Input id="intervalDays" name="intervalDays" type="number" min="1" placeholder="2" required />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="suggestedMessage">Mensagem Sugerida</Label>
                      <Textarea id="suggestedMessage" name="suggestedMessage" placeholder="Template de mensagem para esse cenário" required />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Salvar Cenário</Button>
                    <Button type="button" variant="outline" onClick={() => setShowFollowUpForm(false)}>Cancelar</Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <Button onClick={() => setShowFollowUpForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Cenário
                  </Button>
                  <div className="space-y-3">
                    {followUpScenarios.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Nenhum cenário cadastrado</p>
                    ) : (
                      followUpScenarios.map((scenario) => (
                        <div key={scenario.id} className="jarvis-glass p-4 rounded-lg space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{scenario.scenario}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline">{scenario.channel}</Badge>
                                <Badge variant="secondary">{scenario.attempts}x a cada {scenario.intervalDays} dias</Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                deleteFollowUpScenario(scenario.id);
                                setFollowUpScenarios(getFollowUpScenarios());
                                toast({ title: 'Cenário removido' });
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="text-sm bg-primary/10 p-2 rounded">
                            {scenario.suggestedMessage}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </JarvisCard>
          </TabsContent>

          {/* SCORE */}
          <TabsContent value="score" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <JarvisCard 
                title="Regras de Score" 
                description="Critérios que aumentam ou diminuem pontuação"
                icon={<TrendingUp className="h-5 w-5 text-primary" />}
              >
                {showScoreRuleForm ? (
                  <form onSubmit={handleAddScoreRule} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo</Label>
                      <Select name="type" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aumenta">📈 Aumenta Score</SelectItem>
                          <SelectItem value="diminui">📉 Diminui Score</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="criteria">Critério</Label>
                      <Input id="criteria" name="criteria" placeholder="Ex: Respondeu em menos de 1h" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="points">Pontos</Label>
                      <Input id="points" name="points" type="number" min="1" placeholder="10" required />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Salvar</Button>
                      <Button type="button" variant="outline" onClick={() => setShowScoreRuleForm(false)}>Cancelar</Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <Button onClick={() => setShowScoreRuleForm(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Regra
                    </Button>
                    <div className="space-y-2">
                      {leadScoreRules.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">Nenhuma regra</p>
                      ) : (
                        leadScoreRules.map((rule) => (
                          <div key={rule.id} className="flex items-center justify-between p-2 jarvis-glass rounded">
                            <div className="flex items-center gap-2">
                              <span>{rule.type === 'aumenta' ? '📈' : '📉'}</span>
                              <span className="text-sm">{rule.criteria}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={rule.type === 'aumenta' ? 'default' : 'destructive'}>
                                {rule.type === 'aumenta' ? '+' : '-'}{rule.points}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  deleteLeadScoreRule(rule.id);
                                  setLeadScoreRules(getLeadScoreRules());
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </JarvisCard>

              <JarvisCard 
                title="Configuração de Faixas" 
                description="O que o Jarvis recomenda em cada faixa"
                icon={<BookOpen className="h-5 w-5 text-primary" />}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Score mínimo para fechamento</Label>
                    <Input 
                      type="number" 
                      value={leadScoreConfig.minimumToClose}
                      onChange={(e) => setLeadScoreConfigState({
                        ...leadScoreConfig,
                        minimumToClose: Number(e.target.value)
                      })}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 rounded border border-red-500/30 bg-red-500/10">
                      <p className="text-sm font-medium text-red-400">Baixo (0-39)</p>
                      <Textarea 
                        className="mt-2 text-sm"
                        value={leadScoreConfig.ranges.low.recommendation}
                        onChange={(e) => setLeadScoreConfigState({
                          ...leadScoreConfig,
                          ranges: {
                            ...leadScoreConfig.ranges,
                            low: { ...leadScoreConfig.ranges.low, recommendation: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div className="p-3 rounded border border-yellow-500/30 bg-yellow-500/10">
                      <p className="text-sm font-medium text-yellow-400">Médio (40-69)</p>
                      <Textarea 
                        className="mt-2 text-sm"
                        value={leadScoreConfig.ranges.medium.recommendation}
                        onChange={(e) => setLeadScoreConfigState({
                          ...leadScoreConfig,
                          ranges: {
                            ...leadScoreConfig.ranges,
                            medium: { ...leadScoreConfig.ranges.medium, recommendation: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div className="p-3 rounded border border-green-500/30 bg-green-500/10">
                      <p className="text-sm font-medium text-green-400">Alto (70+)</p>
                      <Textarea 
                        className="mt-2 text-sm"
                        value={leadScoreConfig.ranges.high.recommendation}
                        onChange={(e) => setLeadScoreConfigState({
                          ...leadScoreConfig,
                          ranges: {
                            ...leadScoreConfig.ranges,
                            high: { ...leadScoreConfig.ranges.high, recommendation: e.target.value }
                          }
                        })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveScoreConfig}>Salvar Configuração</Button>
                </div>
              </JarvisCard>
            </div>
          </TabsContent>

          {/* OTE */}
          <TabsContent value="ote" className="space-y-4">
            <JarvisCard 
              title="OTE e Comissões" 
              description="Meta, comissão base, aceleradores e penalidades"
              icon={<Zap className="h-5 w-5 text-primary" />}
            >
              <form onSubmit={handleSaveOTE} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyGoal">Meta Mensal (R$)</Label>
                    <Input 
                      id="monthlyGoal" 
                      name="monthlyGoal" 
                      type="number" 
                      step="0.01"
                      defaultValue={oteConfig?.monthlyGoal || ''}
                      placeholder="100000.00" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="baseCommission">Comissão Base (%)</Label>
                    <Input 
                      id="baseCommission" 
                      name="baseCommission" 
                      type="number" 
                      step="0.1"
                      defaultValue={oteConfig?.baseCommission || ''}
                      placeholder="5" 
                      required 
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="calculationRules">Regras de Cálculo</Label>
                    <Textarea 
                      id="calculationRules" 
                      name="calculationRules" 
                      defaultValue={oteConfig?.calculationRules || ''}
                      placeholder="Descreva como a comissão é calculada, incluindo aceleradores e penalidades" 
                      required 
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="jarvisGuidance">Orientação para o Jarvis</Label>
                    <Textarea 
                      id="jarvisGuidance" 
                      name="jarvisGuidance" 
                      defaultValue={oteConfig?.jarvisGuidance || ''}
                      placeholder="Como o Jarvis deve usar esses dados para orientar prioridade e estratégia" 
                      required 
                    />
                  </div>
                </div>
                <Button type="submit">Salvar Configuração OTE</Button>
              </form>

              {oteConfig && (
                <div className="mt-6 p-4 jarvis-glass rounded-lg">
                  <h3 className="font-medium mb-2">Resumo Atual</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Meta:</span>
                      <span className="ml-2 font-medium">R$ {oteConfig.monthlyGoal.toLocaleString('pt-BR')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Comissão Base:</span>
                      <span className="ml-2 font-medium">{oteConfig.baseCommission}%</span>
                    </div>
                  </div>
                </div>
              )}
            </JarvisCard>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
