import { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { JarvisCard } from '@/components/ui/JarvisCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  getCurrentMonthModuleGoals,
  saveModuleGoal,
  updateModuleGoal,
  deleteModuleGoal,
  calculateWorkingDaysRemaining,
  ModuleGoal,
} from '@/lib/storage';

export function ModulosSection() {
  const [modules, setModules] = useState<ModuleGoal[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', target: '', achieved: '' });
  const workingDays = calculateWorkingDaysRemaining();

  useEffect(() => {
    setModules(getCurrentMonthModuleGoals());
  }, []);

  const handleAdd = () => {
    if (!form.name || !form.target) {
      toast.error('Preencha nome e meta');
      return;
    }
    const now = new Date();
    const saved = saveModuleGoal({
      month: now.getMonth(),
      year: now.getFullYear(),
      name: form.name,
      target: parseInt(form.target) || 0,
      achieved: parseInt(form.achieved) || 0,
    });
    setModules(prev => [...prev, saved]);
    setForm({ name: '', target: '', achieved: '' });
    setIsAdding(false);
    toast.success('Módulo adicionado!');
  };

  const handleUpdate = (id: string) => {
    updateModuleGoal(id, {
      name: form.name,
      target: parseInt(form.target) || 0,
      achieved: parseInt(form.achieved) || 0,
    });
    setModules(getCurrentMonthModuleGoals());
    setEditingId(null);
    setForm({ name: '', target: '', achieved: '' });
    toast.success('Módulo atualizado!');
  };

  const handleUpdateAchieved = (id: string, achieved: number) => {
    updateModuleGoal(id, { achieved });
    setModules(getCurrentMonthModuleGoals());
    toast.success('Progresso atualizado!');
  };

  const handleDelete = (id: string) => {
    deleteModuleGoal(id);
    setModules(prev => prev.filter(m => m.id !== id));
    toast.success('Módulo removido!');
  };

  const startEdit = (mod: ModuleGoal) => {
    setEditingId(mod.id);
    setForm({ name: mod.name, target: mod.target.toString(), achieved: mod.achieved.toString() });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-display font-bold text-foreground">Módulos</h2>
          <span className="text-xs text-muted-foreground font-mono">(unidades)</span>
        </div>
        {!isAdding && (
          <Button size="sm" onClick={() => { setIsAdding(true); setForm({ name: '', target: '', achieved: '' }); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Módulo
          </Button>
        )}
      </div>

      {/* Add form */}
      {isAdding && (
        <JarvisCard className="jarvis-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Nome do Módulo</Label>
              <Input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Ativações"
                className="bg-input border-border font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Meta (unidades)</Label>
              <Input
                type="number"
                value={form.target}
                onChange={e => setForm(p => ({ ...p, target: e.target.value }))}
                placeholder="100"
                className="bg-input border-border font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Já Conquistado</Label>
              <Input
                type="number"
                value={form.achieved}
                onChange={e => setForm(p => ({ ...p, achieved: e.target.value }))}
                placeholder="0"
                className="bg-input border-border font-mono"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4 justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleAdd}>Adicionar</Button>
          </div>
        </JarvisCard>
      )}

      {/* Module cards */}
      {modules.length === 0 && !isAdding && (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p>Nenhum módulo cadastrado para este mês.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {modules.map(mod => {
          const progress = mod.target > 0 ? Math.min((mod.achieved / mod.target) * 100, 100) : 0;
          const remaining = Math.max(mod.target - mod.achieved, 0);
          const daily = workingDays > 0 && remaining > 0 ? Math.ceil(remaining / workingDays) : 0;
          const isEditing = editingId === mod.id;

          if (isEditing) {
            return (
              <JarvisCard key={mod.id} className="jarvis-border">
                <div className="space-y-3">
                  <Input
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="bg-input border-border font-mono"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      value={form.target}
                      onChange={e => setForm(p => ({ ...p, target: e.target.value }))}
                      placeholder="Meta"
                      className="bg-input border-border font-mono"
                    />
                    <Input
                      type="number"
                      value={form.achieved}
                      onChange={e => setForm(p => ({ ...p, achieved: e.target.value }))}
                      placeholder="Conquistado"
                      className="bg-input border-border font-mono"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                    <Button size="sm" onClick={() => handleUpdate(mod.id)}><Check className="h-4 w-4" /></Button>
                  </div>
                </div>
              </JarvisCard>
            );
          }

          return (
            <JarvisCard key={mod.id} className="jarvis-border" glow={progress >= 100}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">{mod.name}</h3>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(mod)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(mod.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold font-mono text-primary">{progress.toFixed(0)}%</span>
                  <span className="text-sm text-muted-foreground">
                    {mod.achieved}/{mod.target} unidades
                  </span>
                </div>

                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Meta</p>
                    <p className="font-mono font-semibold">{mod.target}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Falta</p>
                    <p className="font-mono font-semibold">{remaining}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Por dia</p>
                    <p className="font-mono font-semibold">{daily > 0 ? daily : '✓'}</p>
                  </div>
                </div>

                {/* Quick update */}
                <div className="pt-2 border-t border-border">
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      defaultValue={mod.achieved}
                      className="bg-input border-border font-mono h-8 text-sm"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleUpdateAchieved(mod.id, parseInt((e.target as HTMLInputElement).value) || 0);
                        }
                      }}
                      id={`mod-${mod.id}`}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => {
                        const input = document.getElementById(`mod-${mod.id}`) as HTMLInputElement;
                        handleUpdateAchieved(mod.id, parseInt(input?.value) || 0);
                      }}
                    >
                      Atualizar
                    </Button>
                  </div>
                </div>
              </div>
            </JarvisCard>
          );
        })}
      </div>
    </div>
  );
}
