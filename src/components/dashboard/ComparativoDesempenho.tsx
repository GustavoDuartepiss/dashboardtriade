import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3, Users, Zap, Target, DollarSign } from 'lucide-react';
import { JarvisCard } from '@/components/ui/JarvisCard';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MonthData {
  mrr: number;
  score: number;
  confirmed_clients: number;
  confirmed_revenue: number;
}

interface DailyData {
  day: number;
  nmrr_total: number;
  score: number;
  avg_ticket: number;
  conversion_rate: number;
}

function TrendIcon({ value }: { value: number }) {
  if (value > 0) return <TrendingUp className="h-4 w-4 text-success" />;
  if (value < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function CompCard({ label, current, previous, format = 'number', icon }: {
  label: string;
  current: number;
  previous: number;
  format?: 'currency' | 'number' | 'percent';
  icon: React.ReactNode;
}) {
  const diff = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  const formatValue = (v: number) => {
    if (format === 'currency') return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (format === 'percent') return `${v.toFixed(1)}%`;
    return v.toLocaleString('pt-BR');
  };

  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-2 card-hover">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendIcon value={diff} />
          <span className={`text-xs font-mono font-bold ${diff > 0 ? 'text-success' : diff < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
          </span>
        </div>
      </div>
      <p className="text-xl font-bold font-mono text-foreground">{formatValue(current)}</p>
      <p className="text-xs text-muted-foreground font-mono">
        Mês anterior: {formatValue(previous)}
      </p>
    </div>
  );
}

export function ComparativoDesempenho() {
  const [currentMonth, setCurrentMonth] = useState<MonthData | null>(null);
  const [previousMonth, setPreviousMonth] = useState<MonthData | null>(null);
  const [currentDaily, setCurrentDaily] = useState<DailyData[]>([]);
  const [previousDaily, setPreviousDaily] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const curYear = now.getFullYear();
    const prevMonth = curMonth === 1 ? 12 : curMonth - 1;
    const prevYear = curMonth === 1 ? curYear - 1 : curYear;

    const [curSummary, prevSummary, curDaily, prevDailyData] = await Promise.all([
      supabase.from('monthly_summaries').select('*').eq('month', curMonth).eq('year', curYear).eq('plan_type', 'total').maybeSingle(),
      supabase.from('monthly_summaries').select('*').eq('month', prevMonth).eq('year', prevYear).eq('plan_type', 'total').maybeSingle(),
      supabase.from('daily_metrics').select('*').eq('month', curMonth).eq('year', curYear).order('day'),
      supabase.from('daily_metrics').select('*').eq('month', prevMonth).eq('year', prevYear).order('day'),
    ]);

    const hasSomeData = !!(curSummary.data || prevSummary.data || (curDaily.data && curDaily.data.length > 0));
    setHasData(hasSomeData);

    if (curSummary.data) {
      setCurrentMonth({
        mrr: Number(curSummary.data.mrr),
        score: Number(curSummary.data.score),
        confirmed_clients: curSummary.data.confirmed_clients || 0,
        confirmed_revenue: Number(curSummary.data.confirmed_revenue),
      });
    }

    if (prevSummary.data) {
      setPreviousMonth({
        mrr: Number(prevSummary.data.mrr),
        score: Number(prevSummary.data.score),
        confirmed_clients: prevSummary.data.confirmed_clients || 0,
        confirmed_revenue: Number(prevSummary.data.confirmed_revenue),
      });
    }

    if (curDaily.data) {
      setCurrentDaily(curDaily.data.map(d => ({
        day: d.day,
        nmrr_total: Number(d.nmrr_total),
        score: Number(d.score),
        avg_ticket: Number(d.avg_ticket),
        conversion_rate: Number(d.conversion_rate),
      })));
    }

    if (prevDailyData.data) {
      setPreviousDaily(prevDailyData.data.map(d => ({
        day: d.day,
        nmrr_total: Number(d.nmrr_total),
        score: Number(d.score),
        avg_ticket: Number(d.avg_ticket),
        conversion_rate: Number(d.conversion_rate),
      })));
    }

    setLoading(false);
  };

  if (loading) return null;
  if (!hasData) return null;

  // Build cumulative chart data
  const chartData: Array<{ day: number; atual: number; anterior: number }> = [];
  const maxDays = Math.max(currentDaily.length, previousDaily.length, 1);

  let cumCurrent = 0;
  let cumPrevious = 0;
  for (let d = 1; d <= maxDays; d++) {
    const curDay = currentDaily.find(x => x.day === d);
    const prevDay = previousDaily.find(x => x.day === d);
    if (curDay) cumCurrent += curDay.nmrr_total;
    if (prevDay) cumPrevious += prevDay.nmrr_total;
    chartData.push({ day: d, atual: cumCurrent, anterior: cumPrevious });
  }

  const cur = currentMonth || { mrr: 0, score: 0, confirmed_clients: 0, confirmed_revenue: 0 };
  const prev = previousMonth || { mrr: 0, score: 0, confirmed_clients: 0, confirmed_revenue: 0 };

  // Same day comparison
  const today = new Date().getDate();
  const curUpToDay = currentDaily.filter(d => d.day <= today);
  const prevUpToDay = previousDaily.filter(d => d.day <= today);
  const curMrrToDay = curUpToDay.reduce((acc, d) => acc + d.nmrr_total, 0);
  const prevMrrToDay = prevUpToDay.reduce((acc, d) => acc + d.nmrr_total, 0);
  const dayDiff = prevMrrToDay > 0 ? ((curMrrToDay - prevMrrToDay) / prevMrrToDay * 100) : 0;

  const now = new Date();
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const curMonthName = monthNames[now.getMonth()];
  const prevMonthIdx = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const prevMonthName = monthNames[prevMonthIdx];

  // Avg ticket and conversion for comparison
  const curAvgTicket = curUpToDay.length > 0 ? curUpToDay.reduce((a, d) => a + d.avg_ticket, 0) / curUpToDay.length : 0;
  const prevAvgTicket = prevUpToDay.length > 0 ? prevUpToDay.reduce((a, d) => a + d.avg_ticket, 0) / prevUpToDay.length : 0;
  const curConversion = curUpToDay.length > 0 ? curUpToDay.reduce((a, d) => a + d.conversion_rate, 0) / curUpToDay.length : 0;
  const prevConversion = prevUpToDay.length > 0 ? prevUpToDay.reduce((a, d) => a + d.conversion_rate, 0) / prevUpToDay.length : 0;

  return (
    <div className="space-y-6">
      {/* Same day comparison card */}
      {(currentDaily.length > 0 || previousDaily.length > 0) && (
        <JarvisCard title="Mesmo dia do mês anterior" icon={<BarChart3 className="h-5 w-5" />}>
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-1">
              <p className="text-sm text-muted-foreground">
                Hoje é dia <span className="font-bold text-foreground">{today}</span>. 
                Em <span className="font-semibold text-foreground">{curMonthName}</span> você acumulou{' '}
                <span className="font-bold font-mono text-primary">R$ {curMrrToDay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> de NMRR.
                {prevMrrToDay > 0 && (
                  <>
                    {' '}Em <span className="font-semibold text-foreground">{prevMonthName}</span> no dia {today} você tinha{' '}
                    <span className="font-bold font-mono">R$ {prevMrrToDay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>.
                  </>
                )}
              </p>
            </div>
            {prevMrrToDay > 0 && (
              <div className={`flex items-center gap-2 rounded-lg px-4 py-2 ${dayDiff >= 0 ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                <TrendIcon value={dayDiff} />
                <span className={`text-lg font-bold font-mono ${dayDiff >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {dayDiff > 0 ? '+' : ''}{dayDiff.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </JarvisCard>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <JarvisCard title="Evolução NMRR Acumulado" icon={<TrendingUp className="h-5 w-5" />}>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14%)" />
                <XAxis dataKey="day" stroke="hsl(0 0% 50%)" fontSize={12} tickFormatter={v => `D${v}`} />
                <YAxis stroke="hsl(0 0% 50%)" fontSize={12} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(0 0% 7%)', border: '1px solid hsl(0 0% 14%)', borderRadius: '8px', color: 'hsl(0 0% 93%)' }}
                  formatter={(value: number, name: string) => [
                    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    name === 'atual' ? curMonthName : prevMonthName
                  ]}
                  labelFormatter={v => `Dia ${v}`}
                />
                <Legend formatter={v => v === 'atual' ? curMonthName : prevMonthName} />
                <Line type="monotone" dataKey="atual" stroke="hsl(0 85% 55%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="anterior" stroke="hsl(0 0% 50%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </JarvisCard>
      )}

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <CompCard label="Clientes Confirmados" current={cur.confirmed_clients} previous={prev.confirmed_clients} icon={<Users className="h-4 w-4" />} />
        <CompCard label="MRR Total" current={cur.mrr} previous={prev.mrr} format="currency" icon={<DollarSign className="h-4 w-4" />} />
        <CompCard label="Score Total" current={cur.score} previous={prev.score} icon={<Zap className="h-4 w-4" />} />
        <CompCard label="Ticket Médio" current={curAvgTicket} previous={prevAvgTicket} format="currency" icon={<Target className="h-4 w-4" />} />
        <CompCard label="Conversão" current={curConversion} previous={prevConversion} format="percent" icon={<TrendingUp className="h-4 w-4" />} />
      </div>
    </div>
  );
}
