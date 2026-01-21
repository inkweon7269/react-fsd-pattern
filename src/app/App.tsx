import { QueryProvider } from "@/app/providers/QueryProvider";
import { TodoPage } from "@/pages/todo";

function App() {
  return (
    <QueryProvider>
      <TodoPage />
    </QueryProvider>
  );
}

export default App;
