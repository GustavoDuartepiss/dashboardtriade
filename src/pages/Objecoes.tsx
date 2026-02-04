import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, AlertTriangle, ChevronDown, ChevronUp, CheckCircle, XCircle, Target, Brain, MessageSquare, Undo2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { JarvisCard } from '@/components/ui/JarvisCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { getObjections, saveObjection, deleteObjection, restoreObjection, Objection } from '@/lib/storage';
import { cn } from '@/lib/utils';

const SALES_STAGES = [
  'Primeiro contato',
  'Qualificação',
  'Apresentação',
  'Proposta/Preço',
  'Negociação',
  'Fechamento',
  'Pós-venda',
];

export default function Objecoes() {
  const [objections, setObjections] = useState<Objection[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    objection: '',
    context: '',
    realIntent: '',
    strategy: '',
    bestResponse: '',
    variations: [''],
    closerNotes: '',
    useDiscount: false,
    notes: '',
  });

  useEffect(() => {
    setObjections(getObjections());
  }, []);

  const handleSave = () => {
    if (!formData.objection.trim() || !formData.bestResponse.trim()) {
      toast.error('Preencha a objeção e o discurso sugerido');
      return;
    }

    const saved = saveObjection({
      ...formData,
      variations: formData.variations.filter(v => v.trim()),
    });
    setObjections(prev => [...prev, saved]);
    setFormData({
      objection: '',
      context: '',
      realIntent: '',
      strategy: '',
      bestResponse: '',
      variations: [''],
      closerNotes: '',
      useDiscount: false,
      notes: '',
    });
    setIsOpen(false);
    toast.success('Objeção cadastrada como unidade de decisão!');
  };

  const handleDelete = (id: string) => {
    deleteObjection(id);
    setObjections(prev => prev.filter(o => o.id !== id));
    toast.success('Objeção removida');
  };

  const addVariation = () => {
    setFormData(prev => ({
      ...prev,
      variations: [...prev.variations, ''],
    }));
  };

  const updateVariation = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map((v, i) => i === index ? value : v),
    }));
  };

  const removeVariation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index),
    }));
  };

  const filteredObjections = objections.filter(o => {
    const matchesSearch = o.objection.toLowerCase().includes(search.toLowerCase()) ||
      o.context.toLowerCase().includes(search.toLowerCase()) ||
      o.bestResponse.toLowerCase().includes(search.toLowerCase()) ||
      o.realIntent?.toLowerCase().includes(search.toLowerCase()) ||
      o.strategy?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStage = filterStage === 'all' || o.context === filterStage;
    
    return matchesSearch && matchesStage;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="gradient-text">Objeções</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Unidades de decisão estratégicas para contornar objeções
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Nova Objeção
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="gradient-text">Nova Unidade de Decisão</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* O que o lead fala */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    O que o lead fala *
                  </Label>
                  <Input
                    value={formData.objection}
                    onChange={(e) => setFormData(prev => ({ ...prev, objection: e.target.value }))}
                    placeholder="Ex: Está muito caro, vou pensar..."
                    className="bg-input border-border"
                  />
                </div>

                {/* Etapa da venda */}
                <div className="space-y-2">
                  <Label>Etapa da Venda</Label>
                  <Select
                    value={formData.context}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, context: value }))}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Em qual momento isso ocorre?" />
                    </SelectTrigger>
                    <SelectContent>
                      {SALES_STAGES.map(stage => (
                        <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Intenção real */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-warning" />
                    Intenção Real do Lead
                  </Label>
                  <Textarea
                    value={formData.realIntent}
                    onChange={(e) => setFormData(prev => ({ ...prev, realIntent: e.target.value }))}
                    placeholder="O que o lead realmente quer dizer com isso? Ex: Não viu valor suficiente, está comparando com concorrente..."
                    className="min-h-[60px] bg-input border-border"
                  />
                </div>

                {/* Estratégia */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-success" />
                    Estratégia de Resposta
                  </Label>
                  <Textarea
                    value={formData.strategy}
                    onChange={(e) => setFormData(prev => ({ ...prev, strategy: e.target.value }))}
                    placeholder="Como abordar? Ex: Validar a preocupação, fazer pergunta de ancoragem, criar urgência..."
                    className="min-h-[60px] bg-input border-border"
                  />
                </div>

                {/* Discurso sugerido */}
                <div className="space-y-2">
                  <Label>Discurso Sugerido *</Label>
                  <Textarea
                    value={formData.bestResponse}
                    onChange={(e) => setFormData(prev => ({ ...prev, bestResponse: e.target.value }))}
                    placeholder="O script exato para usar..."
                    className="min-h-[100px] bg-input border-border"
                  />
                </div>

                {/* Variações */}
                <div className="space-y-2">
                  <Label>Variações de Discurso</Label>
                  {formData.variations.map((v, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={v}
                        onChange={(e) => updateVariation(i, e.target.value)}
                        placeholder={`Variação ${i + 1}`}
                        className="bg-input border-border"
                      />
                      {formData.variations.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariation(i)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addVariation}>
                    + Adicionar Variação
                  </Button>
                </div>

                {/* Usar desconto */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <Label>Usar Desconto?</Label>
                    <p className="text-xs text-muted-foreground">Essa objeção pode ser resolvida com desconto?</p>
                  </div>
                  <Switch
                    checked={formData.useDiscount}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, useDiscount: checked }))}
                  />
                </div>

                {/* Observações de Closer Sênior */}
                <div className="space-y-2">
                  <Label className="text-warning">🎯 Observações de Closer Sênior</Label>
                  <Textarea
                    value={formData.closerNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, closerNotes: e.target.value }))}
                    placeholder="Dicas de quem já passou por isso: armadilhas, quando funciona melhor, sinais de que está funcionando..."
                    className="min-h-[80px] bg-input border-border"
                  />
                </div>

                {/* Notas gerais */}
                <div className="space-y-2">
                  <Label>Notas Adicionais</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Qualquer informação extra..."
                    className="min-h-[60px] bg-input border-border"
                  />
                </div>

                <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90">
                  Cadastrar Unidade de Decisão
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <JarvisCard>
          <div className="flex gap-4">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar objeções, intenções, estratégias..."
              className="bg-input border-border flex-1"
            />
            <Select value={filterStage} onValueChange={setFilterStage}>
              <SelectTrigger className="w-[200px] bg-input border-border">
                <SelectValue placeholder="Filtrar por etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as etapas</SelectItem>
                {SALES_STAGES.map(stage => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </JarvisCard>

        {/* Objections List */}
        <div className="space-y-4">
          {filteredObjections.length === 0 ? (
            <JarvisCard>
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma objeção cadastrada</p>
                <p className="text-sm mt-1">Adicione objeções como unidades de decisão estratégicas</p>
              </div>
            </JarvisCard>
          ) : (
            filteredObjections.map(objection => (
              <Collapsible
                key={objection.id}
                open={expandedId === objection.id}
                onOpenChange={(open) => setExpandedId(open ? objection.id : null)}
              >
                <JarvisCard className="jarvis-border">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                        <div className="text-left">
                          <h3 className="font-semibold">"{objection.objection}"</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {objection.context && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                                {objection.context}
                              </span>
                            )}
                            {objection.realIntent && (
                              <span className="text-xs text-muted-foreground">
                                → {objection.realIntent.slice(0, 40)}...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {objection.useDiscount ? (
                          <span className="flex items-center gap-1 text-xs bg-warning/20 text-warning px-2 py-1 rounded">
                            <CheckCircle className="h-3 w-3" />
                            Usa Desconto
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                            <XCircle className="h-3 w-3" />
                            Sem Desconto
                          </span>
                        )}
                        {expandedId === objection.id ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                      {/* Intenção Real */}
                      {objection.realIntent && (
                        <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                          <Label className="text-warning text-sm flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            Intenção Real
                          </Label>
                          <p className="mt-1 text-sm">{objection.realIntent}</p>
                        </div>
                      )}

                      {/* Estratégia */}
                      {objection.strategy && (
                        <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                          <Label className="text-success text-sm flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Estratégia
                          </Label>
                          <p className="mt-1 text-sm">{objection.strategy}</p>
                        </div>
                      )}

                      {/* Discurso */}
                      <div>
                        <Label className="text-muted-foreground text-sm">Discurso Sugerido</Label>
                        <p className="mt-1 p-3 bg-primary/10 rounded-lg">{objection.bestResponse}</p>
                      </div>

                      {/* Variações */}
                      {objection.variations.length > 0 && (
                        <div>
                          <Label className="text-muted-foreground text-sm">Variações</Label>
                          <ul className="mt-1 space-y-2">
                            {objection.variations.map((v, i) => (
                              <li key={i} className="p-2 bg-secondary/50 rounded text-sm">
                                {v}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Observações de Closer */}
                      {objection.closerNotes && (
                        <div className="p-3 bg-accent/50 rounded-lg">
                          <Label className="text-sm">🎯 Observações de Closer Sênior</Label>
                          <p className="mt-1 text-sm italic">{objection.closerNotes}</p>
                        </div>
                      )}

                      {/* Notas */}
                      {objection.notes && (
                        <div>
                          <Label className="text-muted-foreground text-sm">Notas</Label>
                          <p className="mt-1 text-sm text-muted-foreground">{objection.notes}</p>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(objection.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </JarvisCard>
              </Collapsible>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
