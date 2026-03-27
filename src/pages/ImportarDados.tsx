import { useState } from 'react';
import { Upload, Calendar, CheckCircle, XCircle, Eye, Save } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { JarvisCard } from '@/components/ui/JarvisCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { parseMonthlySummary, parseDailyMetrics, type MonthlySummaryRow, type DailyMetricRow } from '@/lib/parsers';

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export default function ImportarDados() {
  const { toast } = useToast();
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(currentYear);
  const [tab, setTab] = useState('resumo');
  const [rawText, setRawText] = useState('');
  const [summaryPreview, setSummaryPreview] = useState<MonthlySummaryRow[] | null>(null);
  const [dailyPreview, setDailyPreview] = useState<DailyMetricRow[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [parseError, setParseError] = useState('');

  const handleProcess = () => {
    setParseError('');
    setSummaryPreview(null);
    setDailyPreview(null);

    if (!rawText.trim()) {
      setParseError('Cole os dados do portal na área de texto.');
      return;
    }

    if (tab === 'resumo') {
      const result = parseMonthlySummary(rawText);
      if (!result) {
        setParseError('Não foi possível detectar o formato de resumo mensal. Verifique se os dados estão no formato correto com colunas separadas por tab.');
        return;
      }
      setSummaryPreview(result);
    } else {
      const result = parseDailyMetrics(rawText);
      if (!result) {
        setParseError('Não foi possível detectar o formato de dados diários. Verifique se os dados estão separados por tab.');
        return;
      }
      setDailyPreview(result);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (tab === 'resumo' && summaryPreview) {
        // Delete existing data for this month/year first
        await supabase
          .from('monthly_summaries')
          .delete()
          .eq('month', month)
          .eq('year', year);

        const rows = summaryPreview.map(row => ({
          month,
          year,
          ...row,
        }));

        const { error } = await supabase.from('monthly_summaries').insert(rows);
        if (error) throw error;

        toast({ title: 'Resumo mensal importado!', description: `Dados de ${months[month - 1]}/${year} salvos com sucesso.` });
      } else if (tab === 'diario' && dailyPreview) {
        await supabase
          .from('daily_metrics')
          .delete()
          .eq('month', month)
          .eq('year', year);

        const rows = dailyPreview.map(row => ({
          month,
          year,
          ...row,
        }));

        const { error } = await supabase.from('daily_metrics').insert(rows);
        if (error) throw error;

        toast({ title: 'Dados diários importados!', description: `${dailyPreview.length} dias de ${months[month - 1]}/${year} salvos.` });
      }

      setRawText('');
      setSummaryPreview(null);
      setDailyPreview(null);
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setRawText('');
    setSummaryPreview(null);
    setDailyPreview(null);
    setParseError('');
  };

  const formatCurrency = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const hasParsedData = (tab === 'resumo' && summaryPreview) || (tab === 'diario' && dailyPreview);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <span className="triade-symbol text-primary text-sm">✦</span>
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Importação</span>
            </div>
            <h1 className="text-4xl font-display font-bold tracking-tight text-foreground mb-2">
              Importar <span className="gradient-text">Dados do Portal</span>
            </h1>
            <p className="text-muted-foreground max-w-lg">
              Cole os dados do seu portal de vendas para análise automática e acompanhamento de performance.
            </p>
          </div>
        </div>

        {/* Month/Year Selector */}
        <div className="flex gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Mês</label>
            <Select value={String(month)} onValueChange={v => setMonth(Number(v))}>
              <SelectTrigger className="w-[180px] bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, i) => (
                  <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Ano</label>
            <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
              <SelectTrigger className="w-[120px] bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-lg px-3 py-2 bg-secondary/30">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-mono">{months[month - 1]} {year}</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={v => { setTab(v); handleCancel(); }}>
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="resumo" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Resumo Mensal
            </TabsTrigger>
            <TabsTrigger value="diario" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Dados Diários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-4 mt-4">
            <JarvisCard title="Colar dados do resumo mensal" icon={<Upload className="h-5 w-5" />}>
              <Textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder={"Cole aqui a tabela do portal com as colunas:\nMensal  Trimestral  Semestral  Anual  Total\n\nAs linhas devem conter:\nClientes confirmados, Clientes pendentes, MRR, Score, Descontos, Faturamento confirmado, Faturamento pendente\n\n(Separados por TAB)"}
                className="min-h-[200px] bg-secondary/30 border-border font-mono text-sm"
              />
              <div className="flex gap-3 mt-4">
                <Button onClick={handleProcess} className="gap-2 bg-primary hover:bg-primary/90">
                  <Eye className="h-4 w-4" />
                  Processar Dados
                </Button>
                <Button variant="outline" onClick={handleCancel} className="border-border">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </JarvisCard>

            {/* Summary Preview */}
            {summaryPreview && (
              <JarvisCard title="Preview dos dados parseados" icon={<CheckCircle className="h-5 w-5 text-success" />}>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead>Plano</TableHead>
                        <TableHead>Confirmados</TableHead>
                        <TableHead>Pendentes</TableHead>
                        <TableHead>MRR</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Descontos</TableHead>
                        <TableHead>Fat. Confirmado</TableHead>
                        <TableHead>Fat. Pendente</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summaryPreview.map(row => (
                        <TableRow key={row.plan_type} className="border-border">
                          <TableCell className="font-semibold capitalize">{row.plan_type}</TableCell>
                          <TableCell className="font-mono">{row.confirmed_clients} ({row.confirmed_clients_pct}%)</TableCell>
                          <TableCell className="font-mono">{row.pending_clients}</TableCell>
                          <TableCell className="font-mono">{formatCurrency(row.mrr)}</TableCell>
                          <TableCell className="font-mono">{row.score.toLocaleString('pt-BR')}</TableCell>
                          <TableCell className="font-mono">{formatCurrency(row.discounts)}</TableCell>
                          <TableCell className="font-mono">{formatCurrency(row.confirmed_revenue)}</TableCell>
                          <TableCell className="font-mono">{formatCurrency(row.pending_revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button onClick={handleSave} disabled={saving} className="gap-2 bg-success hover:bg-success/90 text-success-foreground">
                    <Save className="h-4 w-4" />
                    {saving ? 'Salvando...' : 'Confirmar Importação'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="border-border">
                    Cancelar
                  </Button>
                </div>
              </JarvisCard>
            )}
          </TabsContent>

          <TabsContent value="diario" className="space-y-4 mt-4">
            <JarvisCard title="Colar dados diários" icon={<Upload className="h-5 w-5" />}>
              <Textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder={"Cole aqui os dados diários do portal.\nCada linha = um dia do mês.\n\nColunas (separadas por TAB):\nNome | Pipedrive | Portal | Ticket Médio | NMRR Mensal | NMRR Trimestral | NMRR Semestral | NMRR Anual | NMRR Total | Clientes Mensal | Clientes Tri | Clientes Sem | Clientes Anual | Score | Conversão"}
                className="min-h-[200px] bg-secondary/30 border-border font-mono text-sm"
              />
              <div className="flex gap-3 mt-4">
                <Button onClick={handleProcess} className="gap-2 bg-primary hover:bg-primary/90">
                  <Eye className="h-4 w-4" />
                  Processar Dados
                </Button>
                <Button variant="outline" onClick={handleCancel} className="border-border">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </JarvisCard>

            {/* Daily Preview */}
            {dailyPreview && (
              <JarvisCard title="Preview dos dados diários" icon={<CheckCircle className="h-5 w-5 text-success" />}>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead>Dia</TableHead>
                        <TableHead>Pipedrive</TableHead>
                        <TableHead>Portal</TableHead>
                        <TableHead>Ticket Médio</TableHead>
                        <TableHead>NMRR Total</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Conversão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyPreview.map(row => (
                        <TableRow key={row.day} className="border-border">
                          <TableCell className="font-semibold">Dia {row.day}</TableCell>
                          <TableCell className="font-mono">{row.pipedrive_clients}</TableCell>
                          <TableCell className="font-mono">{row.portal_clients}</TableCell>
                          <TableCell className="font-mono">{formatCurrency(row.avg_ticket)}</TableCell>
                          <TableCell className="font-mono">{formatCurrency(row.nmrr_total)}</TableCell>
                          <TableCell className="font-mono">{row.score.toLocaleString('pt-BR')}</TableCell>
                          <TableCell className="font-mono">{row.conversion_rate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button onClick={handleSave} disabled={saving} className="gap-2 bg-success hover:bg-success/90 text-success-foreground">
                    <Save className="h-4 w-4" />
                    {saving ? 'Salvando...' : 'Confirmar Importação'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="border-border">
                    Cancelar
                  </Button>
                </div>
              </JarvisCard>
            )}
          </TabsContent>
        </Tabs>

        {/* Parse Error */}
        {parseError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-start gap-3">
            <XCircle className="h-5 w-5 text-destructive mt-0.5" />
            <p className="text-sm text-destructive">{parseError}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
