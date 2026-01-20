import { useState, useEffect } from 'react';
import { Plus, Trash2, AlertTriangle, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
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
import { toast } from 'sonner';
import { getObjections, saveObjection, deleteObjection, Objection } from '@/lib/storage';
import { cn } from '@/lib/utils';

export default function Objecoes() {
  const [objections, setObjections] = useState<Objection[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    objection: '',
    context: '',
    bestResponse: '',
    variations: [''],
    useDiscount: false,
    notes: '',
  });

  useEffect(() => {
    setObjections(getObjections());
  }, []);

  const handleSave = () => {
    if (!formData.objection.trim() || !formData.bestResponse.trim()) {
      toast.error('Preencha a objeção e a melhor resposta');
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
      bestResponse: '',
      variations: [''],
      useDiscount: false,
      notes: '',
    });
    setIsOpen(false);
    toast.success('Objeção cadastrada!');
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

  const filteredObjections = objections.filter(o =>
    o.objection.toLowerCase().includes(search.toLowerCase()) ||
    o.context.toLowerCase().includes(search.toLowerCase()) ||
    o.bestResponse.toLowerCase().includes(search.toLowerCase())
  );

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
              Banco de respostas para contornar objeções
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
                <DialogTitle className="gradient-text">Nova Objeção</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Objeção do Cliente *</Label>
                  <Input
                    value={formData.objection}
                    onChange={(e) => setFormData(prev => ({ ...prev, objection: e.target.value }))}
                    placeholder="Ex: Está muito caro"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contexto (Etapa da Venda)</Label>
                  <Input
                    value={formData.context}
                    onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
                    placeholder="Ex: Após apresentação de preço"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Melhor Resposta *</Label>
                  <Textarea
                    value={formData.bestResponse}
                    onChange={(e) => setFormData(prev => ({ ...prev, bestResponse: e.target.value }))}
                    placeholder="A resposta que mais funciona para essa objeção..."
                    className="min-h-[100px] bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Variações de Resposta</Label>
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

                <div className="space-y-2">
                  <Label>Observações Estratégicas</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Dicas extras, quando funciona melhor, etc..."
                    className="min-h-[80px] bg-input border-border"
                  />
                </div>

                <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90">
                  Cadastrar Objeção
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <JarvisCard>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar objeções..."
            className="bg-input border-border"
          />
        </JarvisCard>

        {/* Objections List */}
        <div className="space-y-4">
          {filteredObjections.length === 0 ? (
            <JarvisCard>
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma objeção cadastrada</p>
                <p className="text-sm mt-1">Adicione objeções comuns e suas respostas</p>
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
                          <h3 className="font-semibold">{objection.objection}</h3>
                          {objection.context && (
                            <p className="text-sm text-muted-foreground">{objection.context}</p>
                          )}
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
                      <div>
                        <Label className="text-muted-foreground text-sm">Melhor Resposta</Label>
                        <p className="mt-1 p-3 bg-primary/10 rounded-lg">{objection.bestResponse}</p>
                      </div>

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

                      {objection.notes && (
                        <div>
                          <Label className="text-muted-foreground text-sm">Observações</Label>
                          <p className="mt-1 text-sm italic">{objection.notes}</p>
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
