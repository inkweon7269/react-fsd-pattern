import { useQuery } from "@tanstack/react-query";
import type { GetTodosParams } from "@/entities/todo/model/types";
import { todoApi } from "@/entities/todo/api/todoApi";

// Query Keys - 일관된 키 관리
export const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (params?: GetTodosParams) => [...todoKeys.lists(), params] as const,
  details: () => [...todoKeys.all, "detail"] as const,
  detail: (id: number) => [...todoKeys.details(), id] as const,
  byUser: (userId: number) => [...todoKeys.all, "user", userId] as const,
};

// Todo 목록 조회 훅
export const useTodos = (params?: GetTodosParams) => {
  return useQuery({
    queryKey: todoKeys.list(params),
    queryFn: () => todoApi.getTodos(params),
  });
};

// 단일 Todo 조회 훅
export const useTodo = (id: number) => {
  return useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: () => todoApi.getTodoById(id),
    enabled: !!id, // id가 있을 때만 실행
  });
};

// 특정 유저의 Todo 목록 조회 훅
export const useTodosByUser = (userId: number) => {
  return useQuery({
    queryKey: todoKeys.byUser(userId),
    queryFn: () => todoApi.getTodosByUserId(userId),
    enabled: !!userId,
  });
};
