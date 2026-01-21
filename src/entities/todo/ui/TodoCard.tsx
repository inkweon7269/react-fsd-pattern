import type { Todo } from "@/entities/todo/model/types";

interface TodoCardProps {
  todo: Todo;
}

export const TodoCard = ({ todo }: TodoCardProps) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={todo.completed} readOnly className="mt-1 h-4 w-4" />
        <div className="flex-1">
          <p className={`${todo.completed ? "line-through text-gray-400" : "text-gray-800"}`}>{todo.todo}</p>
          <span className="text-xs text-gray-500">User #{todo.userId}</span>
        </div>
      </div>
    </div>
  );
};
