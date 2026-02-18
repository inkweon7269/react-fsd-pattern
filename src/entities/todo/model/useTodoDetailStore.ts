import { create } from "zustand";

interface TodoDetailState {
  selectedTodoId: number | null;
  isOpen: boolean;

  openDetail: (id: number) => void;
  closeDetail: () => void;
  toggleDetail: (id: number) => void;
}

export const useTodoDetailStore = create<TodoDetailState>((set) => ({
  selectedTodoId: null,
  isOpen: false,

  openDetail: (id) => {
    set({ selectedTodoId: id, isOpen: true });
  },

  closeDetail: () => {
    set({ selectedTodoId: null, isOpen: false });
  },

  toggleDetail: (id) => {
    set((state) => {
      if (state.selectedTodoId === id && state.isOpen) {
        return { selectedTodoId: null, isOpen: false };
      }
      return { selectedTodoId: id, isOpen: true };
    });
  },
}));
