import { TodoList } from "@/widgets/todo-list";

export const TodoPage = () => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📝 할 일 목록</h1>
      <TodoList />
    </div>
  );
};
