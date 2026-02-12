# Todo 삭제 기능 PRD (Product Requirements Document)

## 개요

### 목표
dummyjson API를 사용하여 사용자가 Todo를 삭제할 수 있는 기능 구현

### 배경
현재 프로젝트는 Todo 조회 및 추가 기능이 구현되어 있으며, FSD(Feature-Sliced Design) 아키텍처를 따르고 있습니다. 이 기능은 기존 Mutation 패턴을 확장하고, **Slot Pattern**을 활용하여 FSD 의존성 방향을 준수합니다.

---

## API 명세

### 엔드포인트
```
DELETE https://dummyjson.com/todos/{id}
```

### 요청 (Request)
URL 파라미터로 삭제할 Todo의 `id` 전달

### 응답 (Response)
```json
{
  "id": 1,
  "todo": "Do something nice for someone I care about",
  "completed": true,
  "userId": 26,
  "isDeleted": true,
  "deletedOn": "2024-01-01T00:00:00.000Z"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | number | 삭제된 Todo ID |
| `todo` | string | 할 일 내용 |
| `completed` | boolean | 완료 여부 |
| `userId` | number | 사용자 ID |
| `isDeleted` | boolean | 삭제 여부 (항상 true) |
| `deletedOn` | string | 삭제 시각 (ISO 8601) |

> **참고**: dummyjson API는 시뮬레이션 API로, 실제 서버에서 데이터가 삭제되지 않습니다.

---

## 기능 요구사항

### 사용자 스토리
> 사용자로서, 각 할 일 항목의 삭제 버튼을 클릭하여 해당 항목을 목록에서 제거하고 싶습니다.

### 기능 상세

1. **삭제 버튼**
   - 각 Todo 카드 내부 우측에 배치
   - 클릭 시 삭제 확인 다이얼로그 표시

2. **삭제 확인**
   - `window.confirm`으로 "정말 삭제하시겠습니까?" 확인
   - 확인 시 API 호출, 취소 시 아무 동작 없음

3. **로딩 상태**
   - 삭제 중 버튼 텍스트 변경: "삭제 중..."
   - 삭제 중 버튼 비활성화

4. **성공 처리**
   - 목록 자동 갱신 (캐시 무효화)

---

## 기술 설계

### 아키텍처 (FSD 계층)

```
┌─────────────────────────────────────────────────────────────────┐
│                         widgets                                  │
│                        TodoList                                  │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │  TodoCard(action slot) ◄── TodoDeleteButton 주입        │  │
│    └─────────────────────────────────────────────────────────┘  │
└────────────────────┬──────────────────────┬─────────────────────┘
                     │                      │
         ┌───────────┴───────────┐         │
         ▼                       ▼         ▼
┌─────────────────────┐   ┌─────────────────────┐
│      entities       │   │      features       │
│     TodoCard        │   │  TodoDeleteButton   │
│  (action?: ReactNode)│   │                     │
└─────────────────────┘   └──────────┬──────────┘
                                     │ imports
                                     ▼
                          ┌─────────────────────┐
                          │      entities       │
                          │   useDeleteTodo     │
                          │   (Mutation 훅)     │
                          └─────────────────────┘
```

### Slot Pattern 적용

**핵심 원리**: `entities/TodoCard`는 `ReactNode` 타입의 `action` prop을 받아 어떤 컴포넌트든 렌더링할 수 있습니다. 이를 통해 FSD 의존성 방향(상위 → 하위)을 준수하면서도 카드 내부에 삭제 버튼을 배치할 수 있습니다.

```typescript
// entities/TodoCard - 무엇이 들어올지 모름, ReactNode만 받음
interface TodoCardProps {
  todo: Todo;
  action?: ReactNode;  // 👈 Slot
}

// widgets/TodoList - 상위 레이어에서 조합
<TodoCard
  todo={todo}
  action={<TodoDeleteButton todoId={todo.id} />}  // 👈 주입
/>
```

### 의존성 흐름

```
widgets/TodoList
    ├── entities/TodoCard          ✅ widgets → entities (정방향)
    └── features/TodoDeleteButton  ✅ widgets → features (정방향)
            └── entities/useDeleteTodo  ✅ features → entities (정방향)

TodoCard는 TodoDeleteButton의 존재를 모름 → FSD 완벽 준수
```

### 데이터 흐름

```
[사용자 클릭]
    ↓
[TodoDeleteButton] - 삭제 확인 다이얼로그
    ↓ confirm
[useDeleteTodo] - Mutation 호출
    ↓ mutationFn
[todoApi.deleteTodo] - API 요청
    ↓ DELETE /todos/{id}
[API 응답] - { isDeleted: true }
    ↓ onSuccess
[invalidateQueries] - 캐시 무효화
    ↓
[useTodos 자동 refetch]
    ↓
[TodoList 리렌더링]
```

### 파일 구조 변경

```
src/
├── entities/todo/
│   ├── api/todoApi.ts              # [수정] deleteTodo 함수 추가
│   ├── model/
│   │   ├── types.ts                # [수정] DeleteTodoResponse 타입 추가
│   │   └── useTodoMutations.ts     # [수정] useDeleteTodo 훅 추가
│   ├── ui/TodoCard.tsx             # [수정] action slot prop 추가
│   └── index.ts                    # [수정] 신규 export 추가
│
├── features/todo-delete/           # [생성] 신규 기능
│   ├── ui/TodoDeleteButton.tsx     # [생성] 삭제 버튼 컴포넌트
│   └── index.ts                    # [생성] Barrel Export
│
└── widgets/todo-list/
    └── ui/TodoList.tsx             # [수정] Slot Pattern으로 조합
```

---

## 구현 순서

### Step 1: entities/todo - 타입 정의
`src/entities/todo/model/types.ts`에 응답 타입 추가

```typescript
export interface DeleteTodoResponse extends Todo {
  isDeleted: boolean;
  deletedOn: string;
}
```

### Step 2: entities/todo - API 함수
`src/entities/todo/api/todoApi.ts`에 deleteTodo 함수 추가

```typescript
deleteTodo: async (id: number): Promise<DeleteTodoResponse> => {
  const { data } = await baseApi.delete(`/todos/${id}`);
  return data;
},
```

### Step 3: entities/todo - Mutation 훅
`src/entities/todo/model/useTodoMutations.ts`에 useDeleteTodo 훅 추가

```typescript
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => todoApi.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
};
```

### Step 4: entities/todo - Barrel Export 업데이트
`src/entities/todo/index.ts`에 신규 export 추가
- `useDeleteTodo` 훅
- `DeleteTodoResponse` 타입

### Step 5: entities/todo - TodoCard Slot 추가
`src/entities/todo/ui/TodoCard.tsx`에 action prop 추가

```typescript
import type { ReactNode } from "react";

interface TodoCardProps {
  todo: Todo;
  action?: ReactNode;  // 👈 Slot 추가
}

export const TodoCard = ({ todo, action }: TodoCardProps) => {
  return (
    <div className="...">
      <div className="flex items-start gap-3">
        {/* 기존 UI */}
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
};
```

### Step 6: features/todo-delete - 삭제 버튼 컴포넌트
`src/features/todo-delete/ui/TodoDeleteButton.tsx` 신규 생성

```typescript
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
      className="..."
    >
      {deleteMutation.isPending ? "삭제 중..." : "삭제"}
    </button>
  );
};
```

### Step 7: widgets/todo-list - Slot Pattern 조합
`src/widgets/todo-list/ui/TodoList.tsx`에서 TodoCard의 action slot에 TodoDeleteButton 주입

```typescript
import { TodoDeleteButton } from "@/features/todo-delete";

// 렌더링
{data?.todos.map((todo) => (
  <TodoCard
    key={todo.id}
    todo={todo}
    action={<TodoDeleteButton todoId={todo.id} />}
  />
))}
```

---

## 검증 방법

1. **개발 서버 실행**: `npm run dev`
2. **버튼 렌더링 확인**: 각 Todo 카드 우측에 삭제 버튼 표시
3. **삭제 확인 다이얼로그**: 버튼 클릭 시 확인 창 표시
4. **API 호출 확인**: 네트워크 탭에서 DELETE 요청 확인
5. **응답 확인**: `isDeleted: true` 확인
6. **캐시 무효화**: 삭제 후 목록 자동 갱신
7. **빌드 검증**: `npm run build`로 타입 에러 없음 확인

---

## FSD 패턴 핵심 포인트

### Slot Pattern의 장점

1. **의존성 방향 준수**: `entities`가 `features`를 import하지 않음
2. **재사용성**: `TodoCard`는 다양한 action을 받을 수 있음 (편집, 공유 등)
3. **테스트 용이성**: 각 컴포넌트를 독립적으로 테스트 가능
4. **확장성**: 새로운 기능 추가 시 `TodoCard` 수정 불필요

### 잘못된 접근 (역방향 의존성)

```typescript
// ❌ 잘못된 방식 - entities가 features를 import
// entities/TodoCard.tsx
import { TodoDeleteButton } from "@/features/todo-delete";  // FSD 위반!
```

### 올바른 접근 (Slot Pattern)

```typescript
// ✅ 올바른 방식 - widgets에서 조합
// widgets/TodoList.tsx
<TodoCard
  todo={todo}
  action={<TodoDeleteButton todoId={todo.id} />}
/>
```

---

## 향후 확장 가능성

- **Todo 수정 기능**: `action` slot에 `TodoEditButton` 추가
- **다중 액션**: `action` slot에 버튼 그룹 전달
- **조건부 액션**: 권한에 따라 다른 컴포넌트 주입
- **낙관적 업데이트**: 삭제 시 즉시 UI 반영 후 API 호출
