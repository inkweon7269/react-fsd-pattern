export interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

export interface TodosResponse {
  todos: Todo[];
  total: number;
  skip: number;
  limit: number;
}

export interface GetTodosParams {
  limit?: number;
  skip?: number;
}

// Todo 생성 요청 타입
export interface CreateTodoRequest {
  todo: string;
  completed: boolean;
  userId: number;
}
