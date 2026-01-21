import { useState, type FormEvent } from "react";
import { useCreateTodo } from "@/entities/todo";

export const TodoAddForm = () => {
  const [todoText, setTodoText] = useState("");
  const createTodoMutation = useCreateTodo();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!todoText.trim()) return;

    createTodoMutation.mutate(
      {
        todo: todoText.trim(),
        completed: false,
        userId: 1,
      },
      {
        onSuccess: () => {
          setTodoText("");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        type="text"
        value={todoText}
        onChange={(e) => setTodoText(e.target.value)}
        placeholder="새로운 할 일을 입력하세요"
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={createTodoMutation.isPending}
      />
      <button
        type="submit"
        disabled={!todoText.trim() || createTodoMutation.isPending}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {createTodoMutation.isPending ? "추가 중..." : "추가"}
      </button>
    </form>
  );
};
