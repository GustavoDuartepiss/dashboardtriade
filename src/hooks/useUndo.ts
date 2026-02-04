import { useState, useCallback } from 'react';

interface UndoAction<T> {
  type: 'delete' | 'add' | 'update';
  item: T;
  previousState?: T;
}

interface UseUndoOptions<T> {
  maxHistory?: number;
  onRestore: (item: T) => void;
  onRemove: (id: string) => void;
}

export function useUndo<T extends { id: string }>({ 
  maxHistory = 10,
  onRestore,
  onRemove
}: UseUndoOptions<T>) {
  const [undoStack, setUndoStack] = useState<UndoAction<T>[]>([]);

  const pushUndo = useCallback((action: UndoAction<T>) => {
    setUndoStack(prev => {
      const newStack = [...prev, action];
      if (newStack.length > maxHistory) {
        return newStack.slice(-maxHistory);
      }
      return newStack;
    });
  }, [maxHistory]);

  const recordDelete = useCallback((item: T) => {
    pushUndo({ type: 'delete', item });
  }, [pushUndo]);

  const recordAdd = useCallback((item: T) => {
    pushUndo({ type: 'add', item });
  }, [pushUndo]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return null;

    const lastAction = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));

    if (lastAction.type === 'delete') {
      // Restaurar item deletado
      onRestore(lastAction.item);
      return { type: 'restored' as const, item: lastAction.item };
    } else if (lastAction.type === 'add') {
      // Remover item adicionado
      onRemove(lastAction.item.id);
      return { type: 'removed' as const, item: lastAction.item };
    }

    return null;
  }, [undoStack, onRestore, onRemove]);

  const canUndo = undoStack.length > 0;
  const lastAction = undoStack.length > 0 ? undoStack[undoStack.length - 1] : null;

  const clearHistory = useCallback(() => {
    setUndoStack([]);
  }, []);

  return {
    recordDelete,
    recordAdd,
    undo,
    canUndo,
    lastAction,
    clearHistory,
    historyLength: undoStack.length
  };
}
