import { useState, useEffect } from 'react';
import { Plus, Copy, Trash2, Phone, MessageCircle, Check } from 'lucide-react';
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
import { getFollowUps, saveFollowUp, deleteFollowUp, FollowUp } from '@/lib/storage';
import { cn } from '@/lib/utils';

export default function FollowUps() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filterDay, setFilterDay] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [newFollowUp, setNewFollowUp] = useState({
    day: 1,
    type: 'text' as 'call' | 'text',
    content: '',
  });

  useEffect(() => {
    setFollowUps(getFollowUps());
  }, []);

  const handleSave = () => {
    if (!newFollowUp.content.trim()) {
      toast.error('Preencha o conteúdo do follow-up');
      return;
    }

    const saved = saveFollowUp(newFollowUp);
    setFollowUps(prev => [...prev, saved]);
    setNewFollowUp({ day: 1, type: 'text', content: '' });
    setIsOpen(false);
    toast.success('Follow-up salvo com sucesso!');
  };

  const handleDelete = (id: string) => {
    deleteFollowUp(id);
    setFollowUps(prev => prev.filter(f => f.id !== id));
    toast.success('Follow-up removido');
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success('Copiado para a área de transferência!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredFollowUps = followUps.filter(f => {
    if (filterDay !== 'all' && f.day !== parseInt(filterDay)) return false;
    if (filterType !== 'all' && f.type !== filterType) return false;
    return true;
  });

  const days = Array.from({ length: 14 }, (_, i) => i + 1);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="gradient-text">Follow-ups</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie sua cadência de contatos
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Novo Follow-up
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="gradient-text">Novo Follow-up</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Dia</Label>
                    <Select 
                      value={newFollowUp.day.toString()} 
                      onValueChange={(v) => setNewFollowUp(prev => ({ ...prev, day: parseInt(v) }))}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map(d => (
                          <SelectItem key={d} value={d.toString()}>Dia {d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select 
                      value={newFollowUp.type} 
                      onValueChange={(v) => setNewFollowUp(prev => ({ ...prev, type: v as 'call' | 'text' }))}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="call">Ligação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Conteúdo / Script</Label>
                  <Textarea
                    value={newFollowUp.content}
                    onChange={(e) => setNewFollowUp(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Digite o texto ou script do follow-up..."
                    className="min-h-[120px] bg-input border-border"
                  />
                </div>
                <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90">
                  Salvar Follow-up
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <JarvisCard>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Filtrar por dia</Label>
              <Select value={filterDay} onValueChange={setFilterDay}>
                <SelectTrigger className="w-32 bg-input border-border">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {days.map(d => (
                    <SelectItem key={d} value={d.toString()}>Dia {d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Filtrar por tipo</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32 bg-input border-border">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="call">Ligação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </JarvisCard>

        {/* Follow-ups List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFollowUps.length === 0 ? (
            <JarvisCard className="md:col-span-2">
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum follow-up encontrado</p>
                <p className="text-sm mt-1">Crie seu primeiro follow-up para começar</p>
              </div>
            </JarvisCard>
          ) : (
            filteredFollowUps.map(followUp => (
              <JarvisCard key={followUp.id} className="jarvis-border">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs font-mono bg-primary/20 text-primary rounded">
                        Dia {followUp.day}
                      </span>
                      <span className={cn(
                        'px-2 py-1 text-xs rounded flex items-center gap-1',
                        followUp.type === 'call' 
                          ? 'bg-warning/20 text-warning' 
                          : 'bg-success/20 text-success'
                      )}>
                        {followUp.type === 'call' ? (
                          <>
                            <Phone className="h-3 w-3" />
                            Ligação
                          </>
                        ) : (
                          <>
                            <MessageCircle className="h-3 w-3" />
                            Texto
                          </>
                        )}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(followUp.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-sm leading-relaxed">{followUp.content}</p>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full gap-2 jarvis-border"
                    onClick={() => handleCopy(followUp.content, followUp.id)}
                  >
                    {copiedId === followUp.id ? (
                      <>
                        <Check className="h-4 w-4 text-success" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar Texto
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
