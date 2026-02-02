import { useState, useEffect } from 'react';
import { Plus, Copy, Trash2, Star, Check, Pencil } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { JarvisCard } from '@/components/ui/JarvisCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { getTemplates, saveTemplate, updateTemplate, deleteTemplate, Template } from '@/lib/storage';
import { cn } from '@/lib/utils';

const categories = [
  { value: 'follow-up-padrao', label: 'Follow-up Padrão' },
  { value: 'follow-up-quente', label: 'Follow-up Quente' },
  { value: 'ultima-tentativa', label: 'Última Tentativa' },
  { value: 'link-pagamento', label: 'Link de Pagamento' },
  { value: 'cobranca-link', label: 'Cobrança de Link' },
  { value: 'cobranca-escassez', label: 'Cobrança com Escassez' },
  { value: 'custom', label: 'Personalizado' },
];

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'custom' as Template['category'],
    content: '',
    isFavorite: false,
    leadTemperature: 'morno' as Template['leadTemperature'],
    idealMoment: '',
    objective: 'avancar' as Template['objective'],
  });

  useEffect(() => {
    setTemplates(getTemplates());
  }, []);

  const handleSave = () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, formData);
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, ...formData } : t));
      toast.success('Template atualizado!');
    } else {
      const saved = saveTemplate(formData);
      setTemplates(prev => [...prev, saved]);
      toast.success('Template criado!');
    }

    setFormData({ name: '', category: 'custom', content: '', isFavorite: false, leadTemperature: 'morno', idealMoment: '', objective: 'avancar' });
    setEditingTemplate(null);
    setIsOpen(false);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      content: template.content,
      isFavorite: template.isFavorite,
      leadTemperature: template.leadTemperature || 'morno',
      idealMoment: template.idealMoment || '',
      objective: template.objective || 'avancar',
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast.success('Template removido');
  };

  const handleToggleFavorite = (template: Template) => {
    const newFavorite = !template.isFavorite;
    updateTemplate(template.id, { isFavorite: newFavorite });
    setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, isFavorite: newFavorite } : t));
    toast.success(newFavorite ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success('Copiado para a área de transferência!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTemplates = templates.filter(t => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (showFavoritesOnly && !t.isFavorite) return false;
    return true;
  });

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="gradient-text">Templates</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Mensagens prontas para copiar e usar
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setEditingTemplate(null);
              setFormData({ name: '', category: 'custom', content: '', isFavorite: false, leadTemperature: 'morno', idealMoment: '', objective: 'avancar' });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="gradient-text">
                  {editingTemplate ? 'Editar Template' : 'Novo Template'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Follow-up dia 3"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, category: v as Template['category'] }))}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Conteúdo</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Digite o template da mensagem..."
                    className="min-h-[150px] bg-input border-border"
                  />
                </div>
                <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90">
                  {editingTemplate ? 'Salvar Alterações' : 'Criar Template'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <JarvisCard>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Categoria</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48 bg-input border-border">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant={showFavoritesOnly ? 'default' : 'outline'}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={cn('gap-2', showFavoritesOnly && 'bg-primary')}
            >
              <Star className={cn('h-4 w-4', showFavoritesOnly && 'fill-current')} />
              Favoritos
            </Button>
          </div>
        </JarvisCard>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.length === 0 ? (
            <JarvisCard className="md:col-span-2 lg:col-span-3">
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum template encontrado</p>
              </div>
            </JarvisCard>
          ) : (
            filteredTemplates.map(template => (
              <JarvisCard key={template.id} className="jarvis-border">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {getCategoryLabel(template.category)}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleFavorite(template)}
                        className={cn(
                          'h-8 w-8',
                          template.isFavorite ? 'text-warning' : 'text-muted-foreground'
                        )}
                      >
                        <Star className={cn('h-4 w-4', template.isFavorite && 'fill-current')} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(template)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(template.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm leading-relaxed line-clamp-3">{template.content}</p>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full gap-2 jarvis-border"
                    onClick={() => handleCopy(template.content, template.id)}
                  >
                    {copiedId === template.id ? (
                      <>
                        <Check className="h-4 w-4 text-success" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar
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
