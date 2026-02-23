import { useState, useEffect } from 'react';
import { Plus, Copy, Trash2, Check, Percent } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { JarvisCard } from '@/components/ui/JarvisCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { getDiscounts, saveDiscount, deleteDiscount, Discount } from '@/lib/storage';
import { cn } from '@/lib/utils';

const periods = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' },
];

const types = [
  { value: 'parceria', label: 'Parceria' },
  { value: 'indicacao', label: 'Indicação' },
];

export default function Descontos() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    period: 'mensal' as Discount['period'],
    type: 'parceria' as Discount['type'],
    code: '',
    description: '',
    maxPercentage: 0,
    acceptableSituations: [] as string[],
    requiredCounterpart: '',
    prohibitedSituations: [] as string[],
  });

  useEffect(() => {
    setDiscounts(getDiscounts());
  }, []);

  const handleSave = () => {
    if (!formData.code.trim()) {
      toast.error('Preencha o código do desconto');
      return;
    }

    const saved = saveDiscount(formData);
    setDiscounts(prev => [...prev, saved]);
    setFormData({ period: 'mensal', type: 'parceria', code: '', description: '', maxPercentage: 0, acceptableSituations: [], requiredCounterpart: '', prohibitedSituations: [] });
    setIsOpen(false);
    toast.success('Desconto salvo!');
  };

  const handleDelete = (id: string) => {
    deleteDiscount(id);
    setDiscounts(prev => prev.filter(d => d.id !== id));
    toast.success('Desconto removido');
  };

  const handleCopy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('Código copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredDiscounts = discounts.filter(d => {
    if (filterPeriod !== 'all' && d.period !== filterPeriod) return false;
    if (filterType !== 'all' && d.type !== filterType) return false;
    return true;
  });

  const getPeriodLabel = (period: string) => periods.find(p => p.value === period)?.label || period;
  const getTypeLabel = (type: string) => types.find(t => t.value === type)?.label || type;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="triade-symbol text-primary text-sm">✦</span>
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Gestão de Descontos</span>
              </div>
              <h1 className="text-4xl font-display font-bold tracking-tight text-foreground mb-2">
                <span className="gradient-text">Descontos</span>
              </h1>
              <p className="text-muted-foreground max-w-md">
                Códigos estratégicos para negociações de alto impacto.
              </p>
            </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Novo Desconto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="gradient-text">Novo Desconto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Período</Label>
                    <Select 
                      value={formData.period} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, period: v as Discount['period'] }))}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {periods.map(p => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as Discount['type'] }))}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {types.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Código do Desconto</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="Ex: PARCEIRO2024"
                    className="bg-input border-border font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição (opcional)</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ex: 20% de desconto"
                    className="bg-input border-border"
                  />
                </div>
                <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90">
                  Salvar Desconto
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Quick Select Filters */}
        <JarvisCard>
          <div className="space-y-4">
            <Label className="text-muted-foreground">Seleção rápida por período</Label>
            <div className="flex flex-wrap gap-2">
              {periods.map(period => (
                <Button
                  key={period.value}
                  variant={filterPeriod === period.value ? 'default' : 'outline'}
                  onClick={() => setFilterPeriod(filterPeriod === period.value ? 'all' : period.value)}
                  className={cn(
                    'gap-2',
                    filterPeriod === period.value && 'bg-primary'
                  )}
                >
                  <Percent className="h-4 w-4" />
                  {period.label}
                </Button>
              ))}
            </div>
            <Label className="text-muted-foreground">Seleção rápida por tipo</Label>
            <div className="flex flex-wrap gap-2">
              {types.map(type => (
                <Button
                  key={type.value}
                  variant={filterType === type.value ? 'default' : 'outline'}
                  onClick={() => setFilterType(filterType === type.value ? 'all' : type.value)}
                  className={cn(
                    filterType === type.value && 'bg-primary'
                  )}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
        </JarvisCard>

        {/* Discounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDiscounts.length === 0 ? (
            <JarvisCard className="md:col-span-2 lg:col-span-3">
              <div className="text-center py-8 text-muted-foreground">
                <Percent className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum desconto cadastrado</p>
                <p className="text-sm mt-1">Adicione códigos de desconto para usar nas negociações</p>
              </div>
            </JarvisCard>
          ) : (
            filteredDiscounts.map(discount => (
              <JarvisCard key={discount.id} className="jarvis-border">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2">
                      <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded">
                        {getPeriodLabel(discount.period)}
                      </span>
                      <span className={cn(
                        'px-2 py-1 text-xs rounded',
                        discount.type === 'parceria' 
                          ? 'bg-success/20 text-success' 
                          : 'bg-warning/20 text-warning'
                      )}>
                        {getTypeLabel(discount.type)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(discount.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="bg-secondary/50 rounded-lg p-3 text-center overflow-hidden">
                    <p className="text-2xl font-mono font-bold text-primary truncate">{discount.code}</p>
                  </div>

                  {discount.description && (
                    <p className="text-sm text-muted-foreground text-center">{discount.description}</p>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full gap-2 jarvis-border"
                    onClick={() => handleCopy(discount.code, discount.id)}
                  >
                    {copiedId === discount.id ? (
                      <>
                        <Check className="h-4 w-4 text-success" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar Código
                      </>
                    )}
                  </Button>
                </div>
              </JarvisCard>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
