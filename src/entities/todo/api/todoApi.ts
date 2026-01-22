import { baseApi } from "@/shared";
import type { TodosResponse, GetTodosParams, Todo, CreateTodoRequest, DeleteTodoResponse } from "@/entities/todo/model/types";

export const todoApi = {
  // 전체 Todo 목록 조회
  getTodos: async (params?: GetTodosParams): Promise<TodosResponse> => {
    const { data } = await baseApi.get("/todos", { params });
    return data;
  },

  // 단일 Todo 조회
  getTodoById: async (id: number): Promise<Todo> => {
    const { data } = await baseApi.get(`/todos/${id}`);
    return data;
  },

  // 특정 유저의 Todo 목록 조회
  getTodosByUserId: async (userId: number): Promise<TodosResponse> => {
    const { data } = await baseApi.get(`/todos/user/${userId}`);
    return data;
  },

  // Todo 생성
  createTodo: async (request: CreateTodoRequest): Promise<Todo> => {
    const { data } = await baseApi.post("/todos/add", request);
    return data;
  },

  // Todo 삭제
  deleteTodo: async (id: number): Promise<DeleteTodoResponse> => {
    const { data } = await baseApi.delete(`/todos/${id}`);
    return data;
  },
};
