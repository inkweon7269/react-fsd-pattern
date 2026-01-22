import { useDeleteTodo } from "@/entities/todo";

interface TodoDeleteButtonProps {
  todoId: number;
}

export const TodoDeleteButton = ({ todoId }: TodoDeleteButtonProps) => {
  const deleteMutation = useDeleteTodo();

  const handleDelete = () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      deleteMutation.mutate(todoId);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleteMutation.isPending}
      className="px-2 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {deleteMutation.isPending ? "삭제 중..." : "삭제"}
    </button>
  );
};
