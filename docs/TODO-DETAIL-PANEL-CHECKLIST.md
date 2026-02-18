# Todo 상세보기 사이드 패널 구현 체크리스트

## 개요
- **기능**: Todo 클릭 시 사이드 패널 상세보기
- **상태 관리**: Zustand (UI 상태) + React Query (서버 상태)
- **아키텍처**: FSD (Feature-Sliced Design)
- **핵심 패턴**: Cross-Widget 통신 (entities 레이어 Zustand 스토어)

---

## 구현 체크리스트

### Step 1: Zustand 설치
- [x] `npm install zustand` 실행
- [x] `package.json`에 zustand 의존성 추가 확인

### Step 2: Zustand 스토어 생성
- [x] `src/entities/todo/model/useTodoDetailStore.ts` 생성
  - [x] `TodoDetailState` 인터페이스 정의
    ```typescript
    interface TodoDetailState {
      selectedTodoId: number | null;
      isOpen: boolean;
      openDetail: (id: number) => void;
      closeDetail: () => void;
      toggleDetail: (id: number) => void;
    }
    ```
  - [x] `openDetail` 구현 — `set()`으로 단순 값 설정
  - [x] `closeDetail` 구현 — `set()`으로 초기화
  - [x] `toggleDetail` 구현 — `set((state) => ...)` 콜백으로 조건부 업데이트

### Step 3: entities barrel export 업데이트
- [x] `src/entities/todo/index.ts` 수정
  - [x] `useTodoDetailStore` export 추가

### Step 4: TodoCard에 클릭/활성 props 추가
- [x] `src/entities/todo/ui/TodoCard.tsx` 수정
  - [x] `TodoCardProps`에 `isActive?: boolean` 추가
  - [x] `TodoCardProps`에 `onClick?: () => void` 추가
  - [x] `onClick` 존재 시 `cursor-pointer` 스타일 적용
  - [x] `isActive` 시 `border-blue-500 bg-blue-50` 강조 스타일 적용
  - [x] 기존 사용처(action prop만 사용)에 영향 없음 확인 (optional props)

### Step 5: 사이드 패널 widget 생성
- [x] `src/widgets/todo-detail-panel/` 디렉토리 생성
- [x] `src/widgets/todo-detail-panel/ui/TodoDetailPanel.tsx` 생성
  - [x] `useTodoDetailStore`에서 `selectedTodoId`, `isOpen`, `closeDetail` 읽기
  - [x] `useTodo(selectedTodoId)`로 상세 데이터 조회
  - [x] 오버레이 (반투명 배경, 클릭 시 닫기)
  - [x] 슬라이드 애니메이션 (`translate-x-0` / `translate-x-full` + `transition`)
  - [x] 패널 헤더 (제목 + ✕ 닫기 버튼)
  - [x] 상세 정보 표시 (내용, 상태 뱃지, 작성자, ID)
  - [x] 로딩 상태 (`Spinner` 컴포넌트)
  - [x] 에러 상태 (에러 메시지)
- [x] `src/widgets/todo-detail-panel/index.ts` 생성
  - [x] `TodoDetailPanel` export

### Step 6: TodoList에서 클릭 핸들러 연결
- [x] `src/widgets/todo-list/ui/TodoList.tsx` 수정
  - [x] `useTodoDetailStore` import 추가
  - [x] `selectedTodoId`, `toggleDetail` 가져오기
  - [x] 각 TodoCard에 `onClick={() => toggleDetail(todo.id)}` 전달
  - [x] 각 TodoCard에 `isActive={selectedTodoId === todo.id}` 전달

### Step 7: TodoPage에 패널 조합
- [x] `src/pages/todo/ui/TodoPage.tsx` 수정
  - [x] `TodoDetailPanel` import 추가
  - [x] `TodoList` 아래에 `TodoDetailPanel` 렌더링

---

## 검증 체크리스트

### 기능 테스트
- [ ] Todo 카드 클릭 시 사이드 패널이 오른쪽에서 슬라이드 인되는가?
- [ ] 패널에 상세 정보(내용, 상태, 작성자, ID)가 표시되는가?
- [ ] 같은 카드 재클릭 시 패널이 닫히는가?
- [ ] 다른 카드 클릭 시 패널 내용이 전환되는가?
- [ ] ✕ 버튼 클릭 시 패널이 닫히는가?
- [ ] 오버레이(반투명 배경) 클릭 시 패널이 닫히는가?
- [ ] 선택된 카드에 파란 테두리/배경 강조가 표시되는가?
- [ ] 패널이 닫힌 후 카드 강조가 해제되는가?

### 기술 검증
- [x] `npm run build` — 타입 에러 없음
- [x] `npm run lint` — 린트 에러 없음
- [ ] `npm run dev` — 개발 서버 정상 실행
- [ ] 네트워크 탭에서 `GET /todos/{id}` 요청 확인
- [ ] 콘솔에 에러 없음

### FSD 패턴 검증
- [ ] **의존성 방향 준수**
  - [ ] `pages/TodoPage` → `widgets/TodoList` ✅
  - [ ] `pages/TodoPage` → `widgets/TodoDetailPanel` ✅
  - [ ] `widgets/TodoList` → `entities/useTodoDetailStore` ✅
  - [ ] `widgets/TodoDetailPanel` → `entities/useTodoDetailStore` ✅
  - [ ] `widgets/TodoDetailPanel` → `entities/useTodo` ✅
  - [ ] `widgets/TodoDetailPanel` → `shared/Spinner` ✅
  - [ ] 위젯 간 직접 import 없음 ✅
- [ ] Barrel Export 패턴 적용
- [ ] 절대 경로(`@/`) 사용

---

## 파일 변경 요약

| 상태 | 파일 경로 | 변경 내용 |
|:----:|----------|----------|
| 생성 | `src/entities/todo/model/useTodoDetailStore.ts` | Zustand 스토어 |
| 수정 | `src/entities/todo/index.ts` | `useTodoDetailStore` export 추가 |
| 수정 | `src/entities/todo/ui/TodoCard.tsx` | `onClick`, `isActive` props 추가 |
| 생성 | `src/widgets/todo-detail-panel/ui/TodoDetailPanel.tsx` | 사이드 패널 컴포넌트 |
| 생성 | `src/widgets/todo-detail-panel/index.ts` | Barrel Export |
| 수정 | `src/widgets/todo-list/ui/TodoList.tsx` | 클릭 핸들러 연결 |
| 수정 | `src/pages/todo/ui/TodoPage.tsx` | `TodoDetailPanel` 조합 |

---

## 의존성 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                           pages                                  │
│                         TodoPage                                 │
│                            │                                     │
│              ┌─────────────┴─────────────┐                      │
│              ▼                           ▼                       │
│    ┌─────────────────┐         ┌──────────────────┐             │
│    │    TodoList     │         │ TodoDetailPanel  │             │
│    │    (widget)     │         │    (widget)      │             │
│    └────────┬────────┘         └────────┬─────────┘             │
│             │                           │                        │
└─────────────┼───────────────────────────┼────────────────────────┘
              │                           │
              ▼                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         entities                                 │
│                                                                  │
│   ┌──────────────────────────────────────────┐                  │
│   │        useTodoDetailStore (Zustand)       │                  │
│   │  selectedTodoId: number | null            │                  │
│   │  isOpen: boolean                          │                  │
│   │                                           │                  │
│   │  TodoList가 쓰기 ──▶ ◀── TodoDetailPanel이 읽기  │         │
│   └──────────────────────────────────────────┘                  │
│                                                                  │
│   TodoCard    useTodo (React Query)                             │
└─────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          shared                                  │
│                     Spinner, baseApi                             │
└─────────────────────────────────────────────────────────────────┘

의존성 방향: pages → widgets → entities → shared (모두 정방향 ✅)
위젯 간 직접 의존 없음 — Zustand 스토어를 통한 간접 통신 ✅
```

---

## Zustand 학습 포인트

### 1. `set()` 함수의 두 가지 패턴

```typescript
// 단순 값 설정 — 이전 상태가 필요 없을 때
set({ selectedTodoId: id, isOpen: true })

// 콜백 기반 — 이전 상태에 따라 다음 상태가 달라질 때
set((state) => {
  if (state.selectedTodoId === id) return { ... };
  return { ... };
})
```

### 2. Provider 없이 동작하는 이유

Zustand는 모듈 스코프 싱글톤으로 동작합니다. `create()`가 반환하는 훅은 어디서 import하든 같은 스토어 인스턴스를 참조합니다. React Context처럼 Provider로 감쌀 필요가 없어, FSD 구조에서 레이어 간 상태 공유가 간편합니다.

### 3. Zustand + React Query 역할 분리

| 역할 | 라이브러리 | 예시 |
|------|-----------|------|
| UI 상태 | Zustand | 어떤 Todo가 선택되었는가? 패널이 열려 있는가? |
| 서버 상태 | React Query | 해당 Todo의 실제 데이터는? 캐싱, 리페치 |

두 라이브러리는 대체 관계가 아닌 **보완 관계**로, 각자의 영역에서 최적의 역할을 수행합니다.

### 4. Selector를 통한 성능 최적화 (향후 적용 가능)

```typescript
// 전체 스토어 구독 — isOpen만 바뀌어도 리렌더
const { selectedTodoId, isOpen } = useTodoDetailStore();

// selector로 필요한 값만 구독 — 해당 값이 바뀔 때만 리렌더
const selectedTodoId = useTodoDetailStore((s) => s.selectedTodoId);
```
