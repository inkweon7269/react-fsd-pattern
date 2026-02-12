# Todo 삭제 기능 구현 체크리스트

## 개요
- **기능**: Todo 삭제 기능
- **API**: `DELETE /todos/{id}`
- **아키텍처**: FSD (Feature-Sliced Design)
- **핵심 패턴**: Slot Pattern (의존성 방향 준수)

---

## 구현 체크리스트

### Step 1: entities/todo - 타입 정의
- [x] `src/entities/todo/model/types.ts` 수정
  - [x] `DeleteTodoResponse` 인터페이스 추가
    ```typescript
    export interface DeleteTodoResponse extends Todo {
      isDeleted: boolean;
      deletedOn: string;
    }
    ```

### Step 2: entities/todo - API 함수
- [x] `src/entities/todo/api/todoApi.ts` 수정
  - [x] `DeleteTodoResponse` 타입 import 추가
  - [x] `deleteTodo` 함수 추가
    ```typescript
    deleteTodo: async (id: number): Promise<DeleteTodoResponse> => {
      const { data } = await baseApi.delete(`/todos/${id}`);
      return data;
    },
    ```

### Step 3: entities/todo - Mutation 훅
- [x] `src/entities/todo/model/useTodoMutations.ts` 수정
  - [x] `useDeleteTodo` 훅 구현
    - [x] `mutationFn`: `todoApi.deleteTodo` 호출
    - [x] `onSuccess`: `todoKeys.all` 캐시 무효화

### Step 4: entities/todo - Barrel Export
- [x] `src/entities/todo/index.ts` 수정
  - [x] `useDeleteTodo` export 추가
  - [x] `DeleteTodoResponse` 타입 export 추가

### Step 5: entities/todo - TodoCard Slot 추가
- [x] `src/entities/todo/ui/TodoCard.tsx` 수정
  - [x] `ReactNode` 타입 import 추가
  - [x] `TodoCardProps`에 `action?: ReactNode` 추가
  - [x] 컴포넌트에 `action` prop 받기
  - [x] 조건부 렌더링 추가
    ```typescript
    {action && <div className="flex-shrink-0">{action}</div>}
    ```

### Step 6: features/todo-delete - 삭제 버튼 컴포넌트
- [x] `src/features/todo-delete/` 디렉토리 생성
- [x] `src/features/todo-delete/ui/TodoDeleteButton.tsx` 생성
  - [x] `useDeleteTodo` 훅 import (from entities)
  - [x] `TodoDeleteButtonProps` 인터페이스 정의
  - [x] `handleDelete` 함수 구현
    - [x] `window.confirm` 삭제 확인
    - [x] `deleteMutation.mutate(todoId)` 호출
  - [x] UI 구현
    - [x] 삭제 버튼
    - [x] 로딩 상태: "삭제 중..." 텍스트
    - [x] `disabled` 상태 처리
- [x] `src/features/todo-delete/index.ts` 생성
  - [x] `TodoDeleteButton` export

### Step 7: widgets/todo-list - Slot Pattern 조합
- [x] `src/widgets/todo-list/ui/TodoList.tsx` 수정
  - [x] `TodoDeleteButton` import 추가 (from features)
  - [x] `TodoCard`의 `action` prop에 `TodoDeleteButton` 주입
    ```typescript
    <TodoCard
      key={todo.id}
      todo={todo}
      action={<TodoDeleteButton todoId={todo.id} />}
    />
    ```

---

## 검증 체크리스트

### 기능 테스트
- [ ] 각 Todo 카드 우측에 삭제 버튼이 표시되는가?
- [ ] 삭제 버튼 클릭 시 확인 다이얼로그가 표시되는가?
- [ ] 확인 다이얼로그에서 "취소" 클릭 시 아무 동작 없는가?
- [ ] 확인 다이얼로그에서 "확인" 클릭 시 API 호출이 발생하는가?
- [ ] 삭제 중 버튼 텍스트가 "삭제 중..."으로 변경되는가?
- [ ] 삭제 중 버튼이 비활성화 되는가?
- [ ] 삭제 성공 후 목록이 자동 갱신되는가?

### 기술 검증
- [ ] `npm run dev` - 개발 서버 정상 실행
- [ ] `npm run build` - 타입 에러 없음
- [ ] `npm run lint` - 린트 에러 없음
- [ ] 네트워크 탭에서 DELETE 요청 확인
- [ ] 응답에 `isDeleted: true` 포함 확인
- [ ] 콘솔에 에러 없음

### FSD 패턴 검증
- [ ] **의존성 방향 준수**
  - [ ] `widgets/TodoList` → `entities/TodoCard` ✅
  - [ ] `widgets/TodoList` → `features/TodoDeleteButton` ✅
  - [ ] `features/TodoDeleteButton` → `entities/useDeleteTodo` ✅
  - [ ] `entities/TodoCard` → `features/*` (import 없음) ✅
- [ ] Barrel Export 패턴 적용
- [ ] 절대 경로(`@/`) 사용

### Slot Pattern 검증
- [ ] `TodoCard`가 `ReactNode` 타입의 `action` prop을 받는가?
- [ ] `TodoCard`가 `TodoDeleteButton`의 존재를 모르는가? (import 없음)
- [ ] `widgets` 레이어에서 조합이 이루어지는가?

---

## 파일 변경 요약

| 상태 | 파일 경로 | 변경 내용 |
|:----:|----------|----------|
| 수정 | `src/entities/todo/model/types.ts` | `DeleteTodoResponse` 타입 추가 |
| 수정 | `src/entities/todo/api/todoApi.ts` | `deleteTodo` 함수 추가 |
| 수정 | `src/entities/todo/model/useTodoMutations.ts` | `useDeleteTodo` 훅 추가 |
| 수정 | `src/entities/todo/index.ts` | 신규 export 추가 |
| 수정 | `src/entities/todo/ui/TodoCard.tsx` | `action` slot prop 추가 |
| 생성 | `src/features/todo-delete/ui/TodoDeleteButton.tsx` | 삭제 버튼 컴포넌트 |
| 생성 | `src/features/todo-delete/index.ts` | Barrel Export |
| 수정 | `src/widgets/todo-list/ui/TodoList.tsx` | Slot Pattern 조합 |

---

## 의존성 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                         widgets                                  │
│                        TodoList                                  │
│                            │                                     │
│              ┌─────────────┴─────────────┐                       │
│              ▼                           ▼                       │
│    ┌─────────────────┐         ┌─────────────────┐              │
│    │   TodoCard      │◄────────│TodoDeleteButton │              │
│    │ (action slot)   │  주입    │   (features)    │              │
│    │  (entities)     │         └────────┬────────┘              │
│    └─────────────────┘                  │                        │
│                                         ▼                        │
│                               ┌─────────────────┐               │
│                               │  useDeleteTodo  │               │
│                               │   (entities)    │               │
│                               └─────────────────┘               │
└─────────────────────────────────────────────────────────────────┘

의존성 방향: widgets → features → entities (모두 정방향 ✅)
```

---

## 완료 기준

- [x] 모든 구현 체크리스트 완료
- [ ] 모든 검증 체크리스트 통과
- [ ] 코드 리뷰 완료
- [ ] 문서 업데이트 (FSD-PATTERN-GUIDE.md에 Slot Pattern 추가 권장)

---

## Slot Pattern 학습 포인트

### 왜 Slot Pattern을 사용했는가?

**문제 상황**:
- `TodoCard`(entities) 내부에 삭제 버튼을 배치하고 싶음
- 직접 import하면 `entities → features` 역방향 의존성 발생 (FSD 위반)

**해결 방법**:
- `TodoCard`에 `action?: ReactNode` slot을 추가
- 상위 레이어(`widgets`)에서 slot에 `TodoDeleteButton` 주입
- `TodoCard`는 무엇이 주입되는지 알 필요 없음

### 핵심 원리

```
제어의 역전(IoC):
컴포넌트가 직접 의존성을 가져오는 대신,
외부에서 의존성을 주입받음
```

### 확장 예시

```typescript
// 편집 버튼도 추가하고 싶다면?
<TodoCard
  todo={todo}
  action={
    <>
      <TodoEditButton todoId={todo.id} />
      <TodoDeleteButton todoId={todo.id} />
    </>
  }
/>
```
