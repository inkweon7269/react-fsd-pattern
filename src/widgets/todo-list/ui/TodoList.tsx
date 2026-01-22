import { useState } from "react";
import { useTodos, TodoCard } from "@/entities/todo";
import { TodoAddForm } from "@/features/todo-add";
import { TodoDeleteButton } from "@/features/todo-delete";
import { Spinner } from "@/shared";

export const TodoList = () => {
  const [page, setPage] = useState(0);
  const limit = 10;

  const { data, isLoading, isError, error } = useTodos({
    limit,
    skip: page * limit,
  });

  if (isLoading) return <Spinner />;

  if (isError) {
    return <div className="p-4 text-red-500">에러가 발생했습니다: {error.message}</div>;
  }

  const totalPages = Math.ceil((data?.total ?? 0) / limit);

  return (
    <div className="space-y-4">
      {/* Todo 추가 폼 */}
      <TodoAddForm />

      {/* Todo 목록 */}
      <div className="space-y-2">
        {data?.todos.map((todo) => (
          <TodoCard
            key={todo.id}
            todo={todo}
            action={<TodoDeleteButton todoId={todo.id} />}
          />
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between pt-4">
        <span className="text-sm text-gray-500">
          총 {data?.total}개 중 {page * limit + 1}-{Math.min((page + 1) * limit, data?.total ?? 0)}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            이전
          </button>
          <span className="px-3 py-1">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};
