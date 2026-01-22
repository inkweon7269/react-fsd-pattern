import { useMutation, useQueryClient } from "@tanstack/react-query";
import { todoApi } from "@/entities/todo/api/todoApi";
import { todoKeys } from "@/entities/todo/model/useTodos";
import type { CreateTodoRequest } from "@/entities/todo/model/types";

// Todo 생성 훅
export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateTodoRequest) => todoApi.createTodo(request),
    onSuccess: () => {
      // 모든 todo 목록 캐시 무효화 → 자동 refetch
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
};

// Todo 삭제 훅
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => todoApi.deleteTodo(id),
    onSuccess: () => {
      // 모든 todo 캐시 무효화 (목록 + 상세)
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
};
