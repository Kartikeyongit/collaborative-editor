import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

const useEditorStore = create(
  immer((set, get) => ({
    code: '',
    language: 'javascript',
    output: '',
    undoStack: [],
    redoStack: [],
    maxHistorySize: 50,
    
    setCode: (code) => {
      set((state) => {
        state.undoStack.push({
          code: state.code,
          language: state.language
        });
        
        if (state.undoStack.length > state.maxHistorySize) {
          state.undoStack.shift();
        }
        
        state.code = code;
        state.redoStack = [];
      });
    },
    
    setLanguage: (language) => {
      set((state) => {
        state.language = language;
      });
    },
    
    setOutput: (output) => {
      set((state) => {
        state.output = output;
      });
    },
    
    undo: () => {
      const state = get();
      if (state.undoStack.length === 0) return state.code;
      
      const prevState = state.undoStack[state.undoStack.length - 1];
      
      set((state) => {
        const lastState = state.undoStack.pop();
        state.redoStack.push({
          code: state.code,
          language: state.language
        });
        state.code = lastState.code;
        state.language = lastState.language;
      });
      
      return prevState.code;
    },
    
    redo: () => {
      const state = get();
      if (state.redoStack.length === 0) return state.code;
      
      const nextState = state.redoStack[state.redoStack.length - 1];
      
      set((state) => {
        const next = state.redoStack.pop();
        state.undoStack.push({
          code: state.code,
          language: state.language
        });
        state.code = next.code;
        state.language = next.language;
      });
      
      return nextState.code;
    },
    
    canUndo: () => get().undoStack.length > 0,
    canRedo: () => get().redoStack.length > 0,
    
    clearHistory: () => {
      set((state) => {
        state.undoStack = [];
        state.redoStack = [];
      });
    }
  }))
);

export default useEditorStore;