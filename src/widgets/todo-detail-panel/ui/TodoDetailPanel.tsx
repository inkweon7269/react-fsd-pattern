import { useTodoDetailStore, useTodo } from "@/entities/todo";
import { Spinner } from "@/shared";

export const TodoDetailPanel = () => {
  const { selectedTodoId, isOpen, closeDetail } = useTodoDetailStore();
  const { data: todo, isLoading, isError } = useTodo(selectedTodoId ?? 0);

  return (
    <>
      {/* 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={closeDetail}
        />
      )}

      {/* 사이드 패널 */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">할 일 상세</h2>
          <button
            onClick={closeDetail}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* 본문 */}
        <div className="p-4">
          {isLoading && <Spinner />}

          {isError && (
            <p className="text-red-500 text-sm">상세 정보를 불러올 수 없습니다.</p>
          )}

          {todo && (
            <div className="space-y-4">
              <div>
                <span className="text-xs text-gray-400 uppercase">내용</span>
                <p className="mt-1 text-gray-800">{todo.todo}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase">상태</span>
                <p className="mt-1">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      todo.completed
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {todo.completed ? "완료" : "미완료"}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase">작성자</span>
                <p className="mt-1 text-gray-800">User #{todo.userId}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase">ID</span>
                <p className="mt-1 text-gray-500 text-sm">#{todo.id}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
