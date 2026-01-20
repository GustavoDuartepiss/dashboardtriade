// Local Storage utilities for Jarvis Sales Brain

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
  createdAt: string;
}

export interface Discount {
  id: string;
  period: 'mensal' | 'trimestral' | 'semestral' | 'anual';
  type: 'parceria' | 'indicacao';
  code: string;
  description: string;
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
  createdAt: string;
}

export interface Objection {
  id: string;
  objection: string;
  context: string;
  bestResponse: string;
  variations: string[];
  useDiscount: boolean;
  notes: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  followUps: 'jarvis_followups',
  templates: 'jarvis_templates',
  discounts: 'jarvis_discounts',
  goals: 'jarvis_goals',
  objections: 'jarvis_objections',
};

// Generic storage helpers
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

// Follow-ups
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

// Templates
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
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Follow-up Quente',
      category: 'follow-up-quente',
      content: 'Ei! Vi que você demonstrou bastante interesse. Que tal agendarmos uma call rápida para fecharmos?',
      isFavorite: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Última Tentativa',
      category: 'ultima-tentativa',
      content: 'Olá! Essa é minha última tentativa de contato. Caso não tenha interesse, tudo bem! Mas se quiser aproveitar as condições especiais, me avise hoje.',
      isFavorite: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Link de Pagamento',
      category: 'link-pagamento',
      content: 'Aqui está o link para finalizar sua assinatura: [LINK]. Qualquer dúvida, estou por aqui!',
      isFavorite: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '5',
      name: 'Cobrança Link Enviado',
      category: 'cobranca-link',
      content: 'Oi! Vi que o link ainda está pendente. Posso ajudar com algo? O pagamento está travando em algum ponto?',
      isFavorite: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '6',
      name: 'Cobrança com Escassez',
      category: 'cobranca-escassez',
      content: 'Última chamada! O desconto especial expira hoje às 23:59. Depois disso, só conseguiremos o valor cheio. Posso garantir pra você?',
      isFavorite: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

// Discounts
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

// Goals
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
  // Remove existing goal for same month/year
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

// Objections
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

// Goal calculations
export function calculateWorkingDaysRemaining(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  
  let workingDays = 0;
  
  for (let day = today; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    
    // Monday to Friday (1-5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      workingDays++;
    }
    // Saturday only if it's the last day of month
    else if (dayOfWeek === 6 && day === lastDay) {
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

// Get all data for AI context
export function getAllDataForAI(): {
  followUps: FollowUp[];
  templates: Template[];
  discounts: Discount[];
  goals: Goal[];
  objections: Objection[];
  currentGoal: Goal | null;
  workingDaysRemaining: number;
} {
  return {
    followUps: getFollowUps(),
    templates: getTemplates(),
    discounts: getDiscounts(),
    goals: getGoals(),
    objections: getObjections(),
    currentGoal: getCurrentMonthGoal(),
    workingDaysRemaining: calculateWorkingDaysRemaining(),
  };
}
