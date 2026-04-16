// Local Storage utilities for Jarvis Sales Brain

// ============================================
// TYPES - ESTRUTURAS DE DADOS ESTRATÉGICAS
// ============================================

export interface FollowUp {
  id: string;
  day: number;
  type: 'call' | 'text';
  content: string;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  category: 'follow-up-padrao' | 'follow-up-quente' | 'ultima-tentativa' | 'link-pagamento' | 'cobranca-link' | 'cobranca-escassez' | 'custom';
  content: string;
  isFavorite: boolean;
  // NOVOS CAMPOS - INGESTÃO ESTRATÉGICA
  leadTemperature: 'frio' | 'morno' | 'quente';
  idealMoment: string; // Momento ideal de uso
  objective: 'responder' | 'avancar' | 'fechar';
  createdAt: string;
}

export interface Discount {
  id: string;
  period: 'mensal' | 'trimestral' | 'semestral' | 'anual';
  type: 'parceria' | 'indicacao' | 'fechamento';
  code: string;
  description: string;
  // NOVOS CAMPOS - POLÍTICA DE DESCONTOS
  maxPercentage: number;
  acceptableSituations: string[];
  requiredCounterpart: string;
  prohibitedSituations: string[];
  createdAt: string;
}

export interface Goal {
  id: string;
  month: number;
  year: number;
  meta1: number;
  meta2: number;
  meta3: number;
  achieved: number;
  customWorkingDays?: number; // Dias úteis customizados (sobrescreve cálculo automático)
  createdAt: string;
}

export interface ModuleGoal {
  id: string;
  month: number;
  year: number;
  name: string;
  target: number; // meta em unidades
  achieved: number; // conquistado em unidades
  createdAt: string;
}


// OBJEÇÃO EXPANDIDA - UNIDADE DE DECISÃO
export interface Objection {
  id: string;
  objection: string; // O que o lead fala
  context: string; // Em qual etapa da venda isso ocorre
  realIntent: string; // A intenção real do lead
  strategy: string; // A estratégia correta de resposta
  bestResponse: string; // Discurso sugerido
  variations: string[];
  closerNotes: string; // Observações de closer sênior
  useDiscount: boolean;
  notes: string;
  createdAt: string;
}

// NOVA ESTRUTURA - REGRAS DE FECHAMENTO
export interface ClosingRule {
  id: string;
  situation: string;
  recommendedAction: string;
  prohibitedAction: string;
  strategicReason: string;
  ruleType: 'avancar' | 'segurar' | 'encerrar' | 'testar-compromisso';
  createdAt: string;
}

// NOVA ESTRUTURA - MODOS DE OPERAÇÃO
export type JarvisMode = 'closer' | 'lider' | 'gestor' | 'auditor' | 'estrategista';

export interface JarvisModeConfig {
  mode: JarvisMode;
  tone: string;
  analysisDepth: string;
  recommendationType: string;
}

// NOVA ESTRUTURA - ALERTAS INTELIGENTES
export interface SmartAlert {
  id: string;
  trigger: string;
  reason: string;
  suggestedAction: string;
  priority: 'baixa' | 'media' | 'alta' | 'critica';
  isActive: boolean;
  createdAt: string;
}

// CONFIGURAÇÕES DO JARVIS
export interface JarvisConfig {
  activeMode: JarvisMode;
  autoModeSwitch: boolean;
  personality: {
    actAs: string[];
    principles: string[];
    canDo: string[];
    cannotDo: string[];
  };
}

// ============================================
// NOVOS TIPOS - PLAYBOOK COMPLETO
// ============================================

// PLANOS E VALORES
export interface Plan {
  id: string;
  name: string;
  type: 'mensal' | 'trimestral' | 'semestral' | 'anual';
  fullPrice: number;
  promoPrice: number | null;
  discountRules: string;
  whenToOffer: string;
  whenNotToOffer: string;
  createdAt: string;
}

// FOLLOW-UP ESTRATÉGICO (CENÁRIOS)
export interface FollowUpScenario {
  id: string;
  scenario: string;
  channel: 'whatsapp' | 'ligacao' | 'email';
  suggestedMessage: string;
  attempts: number;
  intervalDays: number;
  createdAt: string;
}

// SCORE DE LEAD
export interface LeadScoreRule {
  id: string;
  type: 'aumenta' | 'diminui';
  criteria: string;
  points: number;
  createdAt: string;
}

export interface LeadScoreConfig {
  minimumToClose: number;
  ranges: {
    low: { min: number; max: number; recommendation: string };
    medium: { min: number; max: number; recommendation: string };
    high: { min: number; max: number; recommendation: string };
  };
}

// OTE E COMISSÕES
export interface OTEConfig {
  id: string;
  monthlyGoal: number;
  baseCommission: number;
  accelerators: OTEAccelerator[];
  penalties: OTEPenalty[];
  calculationRules: string;
  jarvisGuidance: string;
  createdAt: string;
}

export interface OTEAccelerator {
  threshold: number;
  multiplier: number;
  description: string;
}

export interface OTEPenalty {
  condition: string;
  penalty: number;
  description: string;
}

const STORAGE_KEYS = {
  followUps: 'jarvis_followups',
  templates: 'jarvis_templates',
  discounts: 'jarvis_discounts',
  goals: 'jarvis_goals',
  objections: 'jarvis_objections',
  closingRules: 'jarvis_closing_rules',
  smartAlerts: 'jarvis_smart_alerts',
  jarvisConfig: 'jarvis_config',
  // NOVOS KEYS - PLAYBOOK
  plans: 'jarvis_plans',
  followUpScenarios: 'jarvis_followup_scenarios',
  leadScoreRules: 'jarvis_lead_score_rules',
  leadScoreConfig: 'jarvis_lead_score_config',
  oteConfig: 'jarvis_ote_config',
  moduleGoals: 'jarvis_module_goals',
};

// ============================================
// GENERIC STORAGE HELPERS
// ============================================

function getFromStorage<T>(key: string, defaultValue: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function getObjectFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveObjectToStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ============================================
// FOLLOW-UPS
// ============================================

export function getFollowUps(): FollowUp[] {
  return getFromStorage<FollowUp>(STORAGE_KEYS.followUps, []);
}

export function saveFollowUp(followUp: Omit<FollowUp, 'id' | 'createdAt'>): FollowUp {
  const followUps = getFollowUps();
  const newFollowUp: FollowUp = {
    ...followUp,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  followUps.push(newFollowUp);
  saveToStorage(STORAGE_KEYS.followUps, followUps);
  return newFollowUp;
}

export function updateFollowUp(id: string, data: Partial<FollowUp>): void {
  const followUps = getFollowUps();
  const index = followUps.findIndex(f => f.id === id);
  if (index !== -1) {
    followUps[index] = { ...followUps[index], ...data };
    saveToStorage(STORAGE_KEYS.followUps, followUps);
  }
}

export function deleteFollowUp(id: string): void {
  const followUps = getFollowUps().filter(f => f.id !== id);
  saveToStorage(STORAGE_KEYS.followUps, followUps);
}

// ============================================
// TEMPLATES
// ============================================

export function getTemplates(): Template[] {
  return getFromStorage<Template>(STORAGE_KEYS.templates, getDefaultTemplates());
}

export function saveTemplate(template: Omit<Template, 'id' | 'createdAt'>): Template {
  const templates = getTemplates();
  const newTemplate: Template = {
    ...template,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  templates.push(newTemplate);
  saveToStorage(STORAGE_KEYS.templates, templates);
  return newTemplate;
}

export function updateTemplate(id: string, data: Partial<Template>): void {
  const templates = getTemplates();
  const index = templates.findIndex(t => t.id === id);
  if (index !== -1) {
    templates[index] = { ...templates[index], ...data };
    saveToStorage(STORAGE_KEYS.templates, templates);
  }
}

export function deleteTemplate(id: string): void {
  const templates = getTemplates().filter(t => t.id !== id);
  saveToStorage(STORAGE_KEYS.templates, templates);
}

function getDefaultTemplates(): Template[] {
  return [
    {
      id: '1',
      name: 'Follow-up Padrão',
      category: 'follow-up-padrao',
      content: 'Olá! Tudo bem? Estou passando para saber se conseguiu analisar nossa proposta. Fico à disposição para esclarecer qualquer dúvida!',
      isFavorite: true,
      leadTemperature: 'morno',
      idealMoment: '24-48h após primeiro contato',
      objective: 'avancar',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Follow-up Quente',
      category: 'follow-up-quente',
      content: 'Ei! Vi que você demonstrou bastante interesse. Que tal agendarmos uma call rápida para fecharmos?',
      isFavorite: true,
      leadTemperature: 'quente',
      idealMoment: 'Após demonstração de alto interesse',
      objective: 'fechar',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Última Tentativa',
      category: 'ultima-tentativa',
      content: 'Olá! Essa é minha última tentativa de contato. Caso não tenha interesse, tudo bem! Mas se quiser aproveitar as condições especiais, me avise hoje.',
      isFavorite: false,
      leadTemperature: 'frio',
      idealMoment: 'Após 3+ tentativas sem resposta',
      objective: 'fechar',
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Link de Pagamento',
      category: 'link-pagamento',
      content: 'Aqui está o link para finalizar sua assinatura: [LINK]. Qualquer dúvida, estou por aqui!',
      isFavorite: false,
      leadTemperature: 'quente',
      idealMoment: 'Após confirmação verbal de interesse',
      objective: 'fechar',
      createdAt: new Date().toISOString(),
    },
    {
      id: '5',
      name: 'Cobrança Link Enviado',
      category: 'cobranca-link',
      content: 'Oi! Vi que o link ainda está pendente. Posso ajudar com algo? O pagamento está travando em algum ponto?',
      isFavorite: false,
      leadTemperature: 'quente',
      idealMoment: '24h após envio de link não finalizado',
      objective: 'fechar',
      createdAt: new Date().toISOString(),
    },
    {
      id: '6',
      name: 'Cobrança com Escassez',
      category: 'cobranca-escassez',
      content: 'Última chamada! O desconto especial expira hoje às 23:59. Depois disso, só conseguiremos o valor cheio. Posso garantir pra você?',
      isFavorite: true,
      leadTemperature: 'morno',
      idealMoment: 'Último dia de promoção ou fim de mês',
      objective: 'fechar',
      createdAt: new Date().toISOString(),
    },
  ];
}

// ============================================
// DISCOUNTS
// ============================================

export function getDiscounts(): Discount[] {
  return getFromStorage<Discount>(STORAGE_KEYS.discounts, []);
}

export function saveDiscount(discount: Omit<Discount, 'id' | 'createdAt'>): Discount {
  const discounts = getDiscounts();
  const newDiscount: Discount = {
    ...discount,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  discounts.push(newDiscount);
  saveToStorage(STORAGE_KEYS.discounts, discounts);
  return newDiscount;
}

export function updateDiscount(id: string, data: Partial<Discount>): void {
  const discounts = getDiscounts();
  const index = discounts.findIndex(d => d.id === id);
  if (index !== -1) {
    discounts[index] = { ...discounts[index], ...data };
    saveToStorage(STORAGE_KEYS.discounts, discounts);
  }
}

export function deleteDiscount(id: string): void {
  const discounts = getDiscounts().filter(d => d.id !== id);
  saveToStorage(STORAGE_KEYS.discounts, discounts);
}

// ============================================
// GOALS
// ============================================

export function getGoals(): Goal[] {
  return getFromStorage<Goal>(STORAGE_KEYS.goals, []);
}

export function getCurrentMonthGoal(): Goal | null {
  const goals = getGoals();
  const now = new Date();
  return goals.find(g => g.month === now.getMonth() && g.year === now.getFullYear()) || null;
}

export function saveGoal(goal: Omit<Goal, 'id' | 'createdAt'>): Goal {
  const goals = getGoals();
  const filtered = goals.filter(g => !(g.month === goal.month && g.year === goal.year));
  const newGoal: Goal = {
    ...goal,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  filtered.push(newGoal);
  saveToStorage(STORAGE_KEYS.goals, filtered);
  return newGoal;
}

export function updateGoal(id: string, data: Partial<Goal>): void {
  const goals = getGoals();
  const index = goals.findIndex(g => g.id === id);
  if (index !== -1) {
    goals[index] = { ...goals[index], ...data };
    saveToStorage(STORAGE_KEYS.goals, goals);
  }
}

// ============================================
// OBJECTIONS - UNIDADES DE DECISÃO
// ============================================

export function getObjections(): Objection[] {
  return getFromStorage<Objection>(STORAGE_KEYS.objections, []);
}

export function saveObjection(objection: Omit<Objection, 'id' | 'createdAt'>): Objection {
  const objections = getObjections();
  const newObjection: Objection = {
    ...objection,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  objections.push(newObjection);
  saveToStorage(STORAGE_KEYS.objections, objections);
  return newObjection;
}

export function updateObjection(id: string, data: Partial<Objection>): void {
  const objections = getObjections();
  const index = objections.findIndex(o => o.id === id);
  if (index !== -1) {
    objections[index] = { ...objections[index], ...data };
    saveToStorage(STORAGE_KEYS.objections, objections);
  }
}

export function deleteObjection(id: string): void {
  const objections = getObjections().filter(o => o.id !== id);
  saveToStorage(STORAGE_KEYS.objections, objections);
}

export function restoreObjection(objection: Objection): void {
  const objections = getObjections();
  // Verifica se já não existe para evitar duplicatas
  if (!objections.find(o => o.id === objection.id)) {
    objections.push(objection);
    saveToStorage(STORAGE_KEYS.objections, objections);
  }
}

// ============================================
// CLOSING RULES - REGRAS DE FECHAMENTO
// ============================================

export function getClosingRules(): ClosingRule[] {
  return getFromStorage<ClosingRule>(STORAGE_KEYS.closingRules, getDefaultClosingRules());
}

export function saveClosingRule(rule: Omit<ClosingRule, 'id' | 'createdAt'>): ClosingRule {
  const rules = getClosingRules();
  const newRule: ClosingRule = {
    ...rule,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  rules.push(newRule);
  saveToStorage(STORAGE_KEYS.closingRules, rules);
  return newRule;
}

export function deleteClosingRule(id: string): void {
  const rules = getClosingRules().filter(r => r.id !== id);
  saveToStorage(STORAGE_KEYS.closingRules, rules);
}

export function restoreClosingRule(rule: ClosingRule): void {
  const rules = getClosingRules();
  if (!rules.find(r => r.id === rule.id)) {
    rules.push(rule);
    saveToStorage(STORAGE_KEYS.closingRules, rules);
  }
}

function getDefaultClosingRules(): ClosingRule[] {
  return [
    {
      id: '1',
      situation: 'Lead confirmou verbalmente que quer fechar',
      recommendedAction: 'Enviar link de pagamento imediatamente',
      prohibitedAction: 'Ficar explicando mais ou dar tempo para pensar',
      strategicReason: 'Momento de decisão é curto. Cada minuto de espera reduz conversão.',
      ruleType: 'avancar',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      situation: 'Lead pediu desconto sem justificativa',
      recommendedAction: 'Perguntar o motivo e reforçar valor antes de considerar',
      prohibitedAction: 'Dar desconto imediatamente',
      strategicReason: 'Desconto sem contrapartida enfraquece posição e reduz margem.',
      ruleType: 'segurar',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      situation: 'Lead não responde há mais de 7 dias após múltiplas tentativas',
      recommendedAction: 'Enviar mensagem de encerramento elegante',
      prohibitedAction: 'Continuar insistindo ou parecer desesperado',
      strategicReason: 'Preservar autoridade e deixar porta aberta para futuro.',
      ruleType: 'encerrar',
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      situation: 'Lead demonstra interesse mas evita compromisso',
      recommendedAction: 'Fazer pergunta direta: "O que falta para fecharmos hoje?"',
      prohibitedAction: 'Aceitar respostas vagas ou adiar sem próximo passo',
      strategicReason: 'Testar compromisso real separa leads sérios de curiosos.',
      ruleType: 'testar-compromisso',
      createdAt: new Date().toISOString(),
    },
  ];
}

// ============================================
// SMART ALERTS - ALERTAS INTELIGENTES
// ============================================

export function getSmartAlerts(): SmartAlert[] {
  return getFromStorage<SmartAlert>(STORAGE_KEYS.smartAlerts, getDefaultSmartAlerts());
}

export function saveSmartAlert(alert: Omit<SmartAlert, 'id' | 'createdAt'>): SmartAlert {
  const alerts = getSmartAlerts();
  const newAlert: SmartAlert = {
    ...alert,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  alerts.push(newAlert);
  saveToStorage(STORAGE_KEYS.smartAlerts, alerts);
  return newAlert;
}

export function updateSmartAlert(id: string, data: Partial<SmartAlert>): void {
  const alerts = getSmartAlerts();
  const index = alerts.findIndex(a => a.id === id);
  if (index !== -1) {
    alerts[index] = { ...alerts[index], ...data };
    saveToStorage(STORAGE_KEYS.smartAlerts, alerts);
  }
}

export function deleteSmartAlert(id: string): void {
  const alerts = getSmartAlerts().filter(a => a.id !== id);
  saveToStorage(STORAGE_KEYS.smartAlerts, alerts);
}

function getDefaultSmartAlerts(): SmartAlert[] {
  return [
    {
      id: '1',
      trigger: 'Nenhum follow-up feito no dia',
      reason: 'Follow-up diário é essencial para manter pipeline ativo',
      suggestedAction: 'Revisar lista de leads e fazer pelo menos 3 follow-ups',
      priority: 'alta',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      trigger: 'Meta diária abaixo do necessário',
      reason: 'Atraso acumulado compromete meta mensal',
      suggestedAction: 'Focar em leads quentes e acelerar fechamentos',
      priority: 'critica',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      trigger: 'Leads quentes sem retorno há 48h',
      reason: 'Lead quente esfria rápido sem contato',
      suggestedAction: 'Ligar ou enviar mensagem de urgência',
      priority: 'alta',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      trigger: 'Negociação aberta há mais de 14 dias',
      reason: 'Negociações longas demais indicam falta de urgência',
      suggestedAction: 'Criar escassez ou definir prazo para decisão',
      priority: 'media',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

// ============================================
// JARVIS CONFIG - PERSONALIDADE E MODOS
// ============================================

export function getJarvisConfig(): JarvisConfig {
  return getObjectFromStorage<JarvisConfig>(STORAGE_KEYS.jarvisConfig, getDefaultJarvisConfig());
}

export function saveJarvisConfig(config: JarvisConfig): void {
  saveObjectToStorage(STORAGE_KEYS.jarvisConfig, config);
}

export function setJarvisMode(mode: JarvisMode): void {
  const config = getJarvisConfig();
  config.activeMode = mode;
  saveJarvisConfig(config);
}

function getDefaultJarvisConfig(): JarvisConfig {
  return {
    activeMode: 'closer',
    autoModeSwitch: true,
    personality: {
      actAs: ['Closer sênior', 'Líder comercial'],
      principles: [
        'Valor antes de preço',
        'Nunca implorar fechamento',
        'Nunca dar desconto sem contrapartida',
        'Sempre conduzir para próximo passo',
      ],
      canDo: [
        'Corrigir abordagens fracas',
        'Alertar sobre erros estratégicos',
        'Questionar decisões',
        'Sugerir scripts melhores',
      ],
      cannotDo: [
        'Ser submisso',
        'Responder como chatbot genérico',
        'Enviar mensagens fracas',
        'Aceitar desculpas para não fechar',
      ],
    },
  };
}

export function getJarvisModes(): JarvisModeConfig[] {
  return [
    {
      mode: 'closer',
      tone: 'Direto, confiante, orientado a fechamento',
      analysisDepth: 'Foco em objeções e técnicas de fechamento',
      recommendationType: 'Scripts, rebatidas, CTAs',
    },
    {
      mode: 'lider',
      tone: 'Firme, exigente, mas motivador',
      analysisDepth: 'Análise de performance e disciplina',
      recommendationType: 'Cobranças, metas, prioridades',
    },
    {
      mode: 'gestor',
      tone: 'Analítico, estratégico',
      analysisDepth: 'Visão macro de pipeline e métricas',
      recommendationType: 'Otimizações, processos, relatórios',
    },
    {
      mode: 'auditor',
      tone: 'Crítico, detalhista',
      analysisDepth: 'Revisão profunda de conversas e abordagens',
      recommendationType: 'Correções, melhorias, feedbacks',
    },
    {
      mode: 'estrategista',
      tone: 'Consultivo, visionário',
      analysisDepth: 'Planejamento de longo prazo',
      recommendationType: 'Estratégias, posicionamento, diferenciação',
    },
  ];
}

// ============================================
// GOAL CALCULATIONS
// ============================================

export function calculateWorkingDaysRemaining(useCustom: boolean = true): number {
  // Se useCustom, verifica se há dias customizados definidos
  if (useCustom) {
    const goal = getCurrentMonthGoal();
    if (goal?.customWorkingDays !== undefined && goal.customWorkingDays > 0) {
      return goal.customWorkingDays;
    }
  }
  
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  
  let workingDays = 0;
  
  for (let day = today; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      workingDays++;
    } else if (dayOfWeek === 6 && day === lastDay) {
      workingDays++;
    }
  }
  
  return workingDays;
}

export function calculateDailyGoal(target: number, achieved: number): number {
  const remaining = target - achieved;
  const workingDays = calculateWorkingDaysRemaining();
  
  if (workingDays <= 0 || remaining <= 0) return 0;
  
  return Math.ceil(remaining / workingDays);
}

// ============================================
// PLANS - PLANOS E VALORES
// ============================================

export function getPlans(): Plan[] {
  return getFromStorage<Plan>(STORAGE_KEYS.plans, []);
}

export function savePlan(plan: Omit<Plan, 'id' | 'createdAt'>): Plan {
  const plans = getPlans();
  const newPlan: Plan = {
    ...plan,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  plans.push(newPlan);
  saveToStorage(STORAGE_KEYS.plans, plans);
  return newPlan;
}

export function updatePlan(id: string, data: Partial<Plan>): void {
  const plans = getPlans();
  const index = plans.findIndex(p => p.id === id);
  if (index !== -1) {
    plans[index] = { ...plans[index], ...data };
    saveToStorage(STORAGE_KEYS.plans, plans);
  }
}

export function deletePlan(id: string): void {
  const plans = getPlans().filter(p => p.id !== id);
  saveToStorage(STORAGE_KEYS.plans, plans);
}

export function restorePlan(plan: Plan): void {
  const plans = getPlans();
  if (!plans.find(p => p.id === plan.id)) {
    plans.push(plan);
    saveToStorage(STORAGE_KEYS.plans, plans);
  }
}

// ============================================
// FOLLOW-UP SCENARIOS - CENÁRIOS DE FOLLOW-UP
// ============================================

export function getFollowUpScenarios(): FollowUpScenario[] {
  return getFromStorage<FollowUpScenario>(STORAGE_KEYS.followUpScenarios, []);
}

export function saveFollowUpScenario(scenario: Omit<FollowUpScenario, 'id' | 'createdAt'>): FollowUpScenario {
  const scenarios = getFollowUpScenarios();
  const newScenario: FollowUpScenario = {
    ...scenario,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  scenarios.push(newScenario);
  saveToStorage(STORAGE_KEYS.followUpScenarios, scenarios);
  return newScenario;
}

export function updateFollowUpScenario(id: string, data: Partial<FollowUpScenario>): void {
  const scenarios = getFollowUpScenarios();
  const index = scenarios.findIndex(s => s.id === id);
  if (index !== -1) {
    scenarios[index] = { ...scenarios[index], ...data };
    saveToStorage(STORAGE_KEYS.followUpScenarios, scenarios);
  }
}

export function deleteFollowUpScenario(id: string): void {
  const scenarios = getFollowUpScenarios().filter(s => s.id !== id);
  saveToStorage(STORAGE_KEYS.followUpScenarios, scenarios);
}

export function restoreFollowUpScenario(scenario: FollowUpScenario): void {
  const scenarios = getFollowUpScenarios();
  if (!scenarios.find(s => s.id === scenario.id)) {
    scenarios.push(scenario);
    saveToStorage(STORAGE_KEYS.followUpScenarios, scenarios);
  }
}

// ============================================
// LEAD SCORE - REGRAS E CONFIGURAÇÃO
// ============================================

export function getLeadScoreRules(): LeadScoreRule[] {
  return getFromStorage<LeadScoreRule>(STORAGE_KEYS.leadScoreRules, []);
}

export function saveLeadScoreRule(rule: Omit<LeadScoreRule, 'id' | 'createdAt'>): LeadScoreRule {
  const rules = getLeadScoreRules();
  const newRule: LeadScoreRule = {
    ...rule,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  rules.push(newRule);
  saveToStorage(STORAGE_KEYS.leadScoreRules, rules);
  return newRule;
}

export function deleteLeadScoreRule(id: string): void {
  const rules = getLeadScoreRules().filter(r => r.id !== id);
  saveToStorage(STORAGE_KEYS.leadScoreRules, rules);
}

export function restoreLeadScoreRule(rule: LeadScoreRule): void {
  const rules = getLeadScoreRules();
  if (!rules.find(r => r.id === rule.id)) {
    rules.push(rule);
    saveToStorage(STORAGE_KEYS.leadScoreRules, rules);
  }
}

export function getLeadScoreConfig(): LeadScoreConfig {
  return getObjectFromStorage<LeadScoreConfig>(STORAGE_KEYS.leadScoreConfig, {
    minimumToClose: 70,
    ranges: {
      low: { min: 0, max: 39, recommendation: 'Nutrir com conteúdo, não investir tempo direto' },
      medium: { min: 40, max: 69, recommendation: 'Qualificar melhor, buscar sinais de compra' },
      high: { min: 70, max: 100, recommendation: 'Priorizar fechamento, ação imediata' },
    },
  });
}

export function saveLeadScoreConfig(config: LeadScoreConfig): void {
  saveObjectToStorage(STORAGE_KEYS.leadScoreConfig, config);
}

// ============================================
// OTE CONFIG - COMISSÕES E ACELERADORES
// ============================================

export function getOTEConfig(): OTEConfig | null {
  return getObjectFromStorage<OTEConfig | null>(STORAGE_KEYS.oteConfig, null);
}

export function saveOTEConfig(config: Omit<OTEConfig, 'id' | 'createdAt'>): OTEConfig {
  const newConfig: OTEConfig = {
    ...config,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  saveObjectToStorage(STORAGE_KEYS.oteConfig, newConfig);
  return newConfig;
}

export function updateOTEConfig(data: Partial<OTEConfig>): void {
  const current = getOTEConfig();
  if (current) {
    saveObjectToStorage(STORAGE_KEYS.oteConfig, { ...current, ...data });
  }
}

// ============================================
// GET ALL DATA FOR AI - CONTEXTO COMPLETO
// ============================================

export function getAllDataForAI(): {
  followUps: FollowUp[];
  templates: Template[];
  discounts: Discount[];
  goals: Goal[];
  objections: Objection[];
  closingRules: ClosingRule[];
  smartAlerts: SmartAlert[];
  jarvisConfig: JarvisConfig;
  currentGoal: Goal | null;
  workingDaysRemaining: number;
  // NOVOS DADOS DO PLAYBOOK
  plans: Plan[];
  followUpScenarios: FollowUpScenario[];
  leadScoreRules: LeadScoreRule[];
  leadScoreConfig: LeadScoreConfig;
  oteConfig: OTEConfig | null;
} {
  return {
    followUps: getFollowUps(),
    templates: getTemplates(),
    discounts: getDiscounts(),
    goals: getGoals(),
    objections: getObjections(),
    closingRules: getClosingRules(),
    smartAlerts: getSmartAlerts(),
    jarvisConfig: getJarvisConfig(),
    currentGoal: getCurrentMonthGoal(),
    workingDaysRemaining: calculateWorkingDaysRemaining(),
    // NOVOS DADOS DO PLAYBOOK
    plans: getPlans(),
    followUpScenarios: getFollowUpScenarios(),
    leadScoreRules: getLeadScoreRules(),
    leadScoreConfig: getLeadScoreConfig(),
    oteConfig: getOTEConfig(),
  };
}

// ============================================
// IMPORT/EXPORT - IMPORTAÇÃO E EXPORTAÇÃO JSON
// ============================================

export interface PlaybookExport {
  version: string;
  exportedAt: string;
  data: {
    objections: Objection[];
    closingRules: ClosingRule[];
    plans: Plan[];
    discounts: Discount[];
    templates: Template[];
    followUpScenarios: FollowUpScenario[];
    leadScoreRules: LeadScoreRule[];
    leadScoreConfig: LeadScoreConfig;
    oteConfig: OTEConfig | null;
  };
}

export function exportPlaybook(): PlaybookExport {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data: {
      objections: getObjections(),
      closingRules: getClosingRules(),
      plans: getPlans(),
      discounts: getDiscounts(),
      templates: getTemplates(),
      followUpScenarios: getFollowUpScenarios(),
      leadScoreRules: getLeadScoreRules(),
      leadScoreConfig: getLeadScoreConfig(),
      oteConfig: getOTEConfig(),
    },
  };
}

export function importPlaybook(data: PlaybookExport): void {
  if (data.data.objections) {
    saveToStorage(STORAGE_KEYS.objections, data.data.objections);
  }
  if (data.data.closingRules) {
    saveToStorage(STORAGE_KEYS.closingRules, data.data.closingRules);
  }
  if (data.data.plans) {
    saveToStorage(STORAGE_KEYS.plans, data.data.plans);
  }
  if (data.data.discounts) {
    saveToStorage(STORAGE_KEYS.discounts, data.data.discounts);
  }
  if (data.data.templates) {
    saveToStorage(STORAGE_KEYS.templates, data.data.templates);
  }
  if (data.data.followUpScenarios) {
    saveToStorage(STORAGE_KEYS.followUpScenarios, data.data.followUpScenarios);
  }
  if (data.data.leadScoreRules) {
    saveToStorage(STORAGE_KEYS.leadScoreRules, data.data.leadScoreRules);
  }
  if (data.data.leadScoreConfig) {
    saveObjectToStorage(STORAGE_KEYS.leadScoreConfig, data.data.leadScoreConfig);
  }
  if (data.data.oteConfig) {
    saveObjectToStorage(STORAGE_KEYS.oteConfig, data.data.oteConfig);
  }
}
