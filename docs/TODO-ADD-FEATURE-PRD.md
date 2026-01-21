# Todo 추가 기능 PRD (Product Requirements Document)

## 개요

### 목표
dummyjson API를 사용하여 사용자가 새로운 Todo를 추가할 수 있는 기능 구현

### 배경
현재 프로젝트는 Todo 조회 기능만 구현되어 있으며, FSD(Feature-Sliced Design) 아키텍처를 따르고 있습니다. 이 기능은 기존 패턴을 확장하여 데이터 변경(Mutation) 기능을 추가합니다.

---

## API 명세

### 엔드포인트
```
POST https://dummyjson.com/todos/add
```

### 요청 (Request)
```json
{
  "todo": "할 일 내용",
  "completed": false,
  "userId": 1
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `todo` | string | O | 할 일 내용 |
| `completed` | boolean | O | 완료 여부 |
| `userId` | number | O | 사용자 ID |

### 응답 (Response)
```json
{
  "id": 151,
  "todo": "할 일 내용",
  "completed": false,
  "userId": 1
}
```

> **참고**: dummyjson API는 시뮬레이션 API로, 실제 서버에 데이터가 저장되지 않습니다.

---

## 기능 요구사항

### 사용자 스토리
> 사용자로서, 새로운 할 일을 입력하고 추가 버튼을 클릭하여 목록에 할 일을 추가하고 싶습니다.

### 기능 상세

1. **입력 폼**
   - 텍스트 입력 필드 제공
   - 빈 문자열 입력 시 추가 버튼 비활성화
   - 플레이스홀더: "새로운 할 일을 입력하세요"

2. **추가 버튼**
   - 클릭 시 API 호출
   - 로딩 중 버튼 텍스트 변경: "추가 중..."
   - 로딩 중 입력 필드 및 버튼 비활성화

3. **성공 처리**
   - 입력 필드 초기화
   - 목록 자동 갱신 (캐시 무효화)

4. **에러 처리**
   - 에러 메시지 표시 (선택적)

---

## 기술 설계

### 아키텍처 (FSD 계층)

```
┌─────────────────────────────────────────────────────┐
│                    widgets                          │
│              TodoList (폼 + 목록 조합)               │
└──────────────────────┬──────────────────────────────┘
                       │ imports
          ┌────────────┴────────────┐
          ▼                         ▼
┌─────────────────────┐   ┌─────────────────────┐
│      features       │   │      entities       │
│  TodoAddForm (폼)   │   │  useTodos (목록)    │
└─────────┬───────────┘   └─────────────────────┘
          │ imports
          ▼
┌─────────────────────┐
│      entities       │
│  useCreateTodo      │
│  (Mutation 훅)      │
└─────────────────────┘
```

### 데이터 흐름

```
[사용자 입력]
    ↓
[TodoAddForm] - 폼 상태 관리
    ↓ handleSubmit
[useCreateTodo] - Mutation 호출
    ↓ mutationFn
[todoApi.createTodo] - API 요청
    ↓ POST /todos/add
[API 응답]
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
│   ├── api/todoApi.ts              # [수정] createTodo 함수 추가
│   ├── model/
│   │   ├── types.ts                # [수정] CreateTodoRequest 타입 추가
│   │   ├── useTodos.ts             # [기존] Query 훅
│   │   └── useTodoMutations.ts     # [생성] Mutation 훅
│   └── index.ts                    # [수정] 신규 export 추가
│
├── features/todo-add/              # [생성] 신규 계층
│   ├── ui/TodoAddForm.tsx          # [생성] 폼 컴포넌트
│   └── index.ts                    # [생성] Barrel Export
│
└── widgets/todo-list/
    └── ui/TodoList.tsx             # [수정] TodoAddForm 통합
```

---

## 구현 순서

### Step 1: entities/todo - 타입 정의
`src/entities/todo/model/types.ts`에 요청 타입 추가

```typescript
export interface CreateTodoRequest {
  todo: string;
  completed: boolean;
  userId: number;
}
```

### Step 2: entities/todo - API 함수
`src/entities/todo/api/todoApi.ts`에 createTodo 함수 추가

```typescript
createTodo: async (request: CreateTodoRequest): Promise<Todo> => {
  const { data } = await baseApi.post("/todos/add", request);
  return data;
},
```

### Step 3: entities/todo - Mutation 훅
`src/entities/todo/model/useTodoMutations.ts` 신규 생성

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { todoApi } from "@/entities/todo/api/todoApi";
import { todoKeys } from "@/entities/todo/model/useTodos";
import type { CreateTodoRequest } from "@/entities/todo/model/types";

export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateTodoRequest) => todoApi.createTodo(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
};
```

### Step 4: entities/todo - Barrel Export 업데이트
`src/entities/todo/index.ts`에 신규 export 추가

### Step 5: features/todo-add - 폼 컴포넌트
`src/features/todo-add/ui/TodoAddForm.tsx` 신규 생성
- useState로 입력 상태 관리
- useCreateTodo로 Mutation 처리
- 로딩/에러 상태 UI 반영

### Step 6: widgets/todo-list - 통합
`src/widgets/todo-list/ui/TodoList.tsx`에 TodoAddForm 배치

---

## 검증 방법

1. **개발 서버 실행**: `npm run dev`
2. **폼 렌더링 확인**: Todo 목록 상단에 입력 폼 표시
3. **입력 유효성**: 빈 문자열 시 버튼 비활성화
4. **API 호출 확인**: 네트워크 탭에서 POST 요청 확인
5. **캐시 무효화**: 추가 후 목록 자동 갱신
6. **빌드 검증**: `npm run build`로 타입 에러 없음 확인

---

## 향후 확장 가능성

- Todo 수정(UPDATE) 기능 추가
- Todo 삭제(DELETE) 기능 추가
- 낙관적 업데이트(Optimistic Update) 적용
- 폼 유효성 검사 강화 (최대 글자 수 등)
- 사용자 인증 연동 (userId 동적 처리)
