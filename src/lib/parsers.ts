// Parser utilities for portal data import

export interface MonthlySummaryRow {
  plan_type: 'mensal' | 'trimestral' | 'semestral' | 'anual' | 'total';
  confirmed_clients: number;
  confirmed_clients_pct: number;
  pending_clients: number;
  mrr: number;
  score: number;
  discounts: number;
  confirmed_revenue: number;
  pending_revenue: number;
}

export interface DailyMetricRow {
  day: number;
  closer_name: string;
  pipedrive_clients: number;
  portal_clients: number;
  avg_ticket: number;
  nmrr_monthly: number;
  nmrr_quarterly: number;
  nmrr_semiannual: number;
  nmrr_annual: number;
  nmrr_total: number;
  clients_monthly: number;
  clients_quarterly: number;
  clients_semiannual: number;
  clients_annual: number;
  score: number;
  conversion_rate: number;
}

function parseNumber(value: string): number {
  if (!value || value.trim() === '' || value.trim() === '-') return 0;
  // Remove R$, %, dots (thousand sep), replace comma with dot
  const cleaned = value
    .replace(/R\$\s*/g, '')
    .replace(/%/g, '')
    .replace(/\(.*?\)/g, '') // remove parenthetical like (69,74%)
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseNumberWithPct(value: string): { num: number; pct: number } {
  const pctMatch = value.match(/\((\d+[,.]?\d*)\s*%\)/);
  const pct = pctMatch ? parseFloat(pctMatch[1].replace(',', '.')) : 0;
  const numStr = value.replace(/\(.*?\)/, '').trim();
  const num = parseNumber(numStr);
  return { num, pct };
}

export function parseMonthlySummary(text: string): MonthlySummaryRow[] | null {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return null;

  // Find header line with plan types
  const headerLine = lines.find(l => 
    l.toLowerCase().includes('mensal') && l.toLowerCase().includes('trimestral')
  );
  if (!headerLine) return null;

  // Map row labels to fields
  const rowMap: Record<string, string> = {
    'clientes confirmados': 'confirmed_clients',
    'clientes pendentes': 'pending_clients',
    'mrr': 'mrr',
    'score': 'score',
    'descontos': 'discounts',
    'faturamento confirmado': 'confirmed_revenue',
    'faturamento pendente': 'pending_revenue',
  };

  const planTypes: Array<'mensal' | 'trimestral' | 'semestral' | 'anual' | 'total'> = 
    ['mensal', 'trimestral', 'semestral', 'anual', 'total'];

  const result: Record<string, Record<string, number>> = {};
  const pctResult: Record<string, number> = {};
  
  for (const pt of planTypes) {
    result[pt] = {
      confirmed_clients: 0,
      confirmed_clients_pct: 0,
      pending_clients: 0,
      mrr: 0,
      score: 0,
      discounts: 0,
      confirmed_revenue: 0,
      pending_revenue: 0,
    };
  }

  for (const line of lines) {
    if (line === headerLine) continue;
    
    const lowerLine = line.toLowerCase();
    let matchedField = '';
    let labelEnd = 0;
    
    for (const [label, field] of Object.entries(rowMap)) {
      if (lowerLine.startsWith(label)) {
        matchedField = field;
        labelEnd = label.length;
        break;
      }
    }
    
    if (!matchedField) continue;

    // Split remainder by tab
    const remainder = line.substring(labelEnd);
    const values = remainder.split('\t').filter(v => v.trim() !== '');
    
    for (let i = 0; i < Math.min(values.length, planTypes.length); i++) {
      const pt = planTypes[i];
      if (matchedField === 'confirmed_clients') {
        const { num, pct } = parseNumberWithPct(values[i]);
        result[pt].confirmed_clients = num;
        result[pt].confirmed_clients_pct = pct;
      } else {
        result[pt][matchedField] = parseNumber(values[i]);
      }
    }
  }

  return planTypes.map(pt => ({
    plan_type: pt,
    confirmed_clients: result[pt].confirmed_clients,
    confirmed_clients_pct: result[pt].confirmed_clients_pct,
    pending_clients: result[pt].pending_clients,
    mrr: result[pt].mrr,
    score: result[pt].score,
    discounts: result[pt].discounts,
    confirmed_revenue: result[pt].confirmed_revenue,
    pending_revenue: result[pt].pending_revenue,
  }));
}

export function parseDailyMetrics(text: string): DailyMetricRow[] | null {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return null;

  const results: DailyMetricRow[] = [];
  let dayCounter = 1;

  // Skip header line if it contains non-numeric first column
  const startIdx = lines[0].split('\t').length > 5 ? 1 : 0;

  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split('\t').map(c => c.trim());
    if (cols.length < 5) continue;

    // Try to detect if first column is a name or day number
    const firstCol = cols[0];
    let closerName = '';
    let dataStart = 0;

    // If first col is text (name), use it
    if (isNaN(Number(firstCol.replace(/\D/g, '')))) {
      closerName = firstCol;
      dataStart = 1;
    }

    const getNum = (idx: number) => parseNumber(cols[dataStart + idx] || '0');

    results.push({
      day: dayCounter++,
      closer_name: closerName,
      pipedrive_clients: getNum(0),
      portal_clients: getNum(1),
      avg_ticket: getNum(2),
      nmrr_monthly: getNum(3),
      nmrr_quarterly: getNum(4),
      nmrr_semiannual: getNum(5),
      nmrr_annual: getNum(6),
      nmrr_total: getNum(7),
      clients_monthly: getNum(8),
      clients_quarterly: getNum(9),
      clients_semiannual: getNum(10),
      clients_annual: getNum(11),
      score: getNum(12),
      conversion_rate: getNum(13),
    });
  }

  return results.length > 0 ? results : null;
}
