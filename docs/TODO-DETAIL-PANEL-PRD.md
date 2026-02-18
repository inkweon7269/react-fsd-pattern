# Todo 상세보기 사이드 패널 PRD (Product Requirements Document)

## 개요

### 목표
Zustand를 활용하여 Todo 클릭 시 사이드 패널에 상세 정보를 표시하는 기능 구현

### 배경
현재 프로젝트는 React Query로 서버 상태를, `useState`로 로컬 UI 상태를 관리하고 있습니다. 여러 컴포넌트가 공유해야 하는 **패널 열림/닫힘 상태**와 **선택된 Todo ID**를 Zustand로 관리하여, 전역 상태 관리 라이브러리를 도입합니다.

### 핵심 학습 포인트
- Zustand 스토어 생성 (`create`)
- `set()` 함수의 두 가지 패턴 (단순 설정 vs 콜백 기반 조건부 업데이트)
- Zustand(UI 상태) + React Query(서버 상태) 역할 분리
- FSD 아키텍처에서 cross-widget 상태 공유 패턴

---

## 기능 요구사항

### 사용자 스토리
> 사용자로서, Todo 카드를 클릭하여 오른쪽 사이드 패널에서 상세 정보를 확인하고 싶습니다.

### 기능 상세

1. **카드 클릭**
   - Todo 카드 클릭 시 오른쪽에서 사이드 패널 슬라이드 인
   - 클릭된 카드는 파란 테두리와 배경으로 시각적 강조

2. **토글 동작**
   - 같은 카드 재클릭 시 패널 닫힘
   - 다른 카드 클릭 시 해당 Todo로 내용 전환

3. **패널 닫기**
   - ✕ 버튼 클릭으로 닫기
   - 오버레이(반투명 배경) 클릭으로 닫기

4. **상세 정보 표시**
   - 내용 (todo)
   - 상태 (완료/미완료 뱃지)
   - 작성자 (userId)
   - ID

5. **로딩/에러 상태**
   - 데이터 로딩 중 Spinner 표시
   - 에러 발생 시 에러 메시지 표시

---

## 기술 설계

### 아키텍처 (FSD 계층)

```
┌────────────────────────────────────────────────────────────┐
│                          pages                              │
│                        TodoPage                             │
│          ┌──────────────┴──────────────┐                   │
│          ▼                              ▼                   │
│    ┌──────────┐               ┌──────────────────┐         │
│    │ TodoList │               │ TodoDetailPanel  │         │
│    │(widget)  │               │    (widget)      │         │
│    └────┬─────┘               └────────┬─────────┘         │
│         │                              │                    │
└─────────┼──────────────────────────────┼────────────────────┘
          │                              │
          ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        entities                              │
│              useTodoDetailStore (Zustand)                    │
│              useTodo (React Query)                           │
│              TodoCard                                        │
└─────────────────────────────────────────────────────────────┘
```

### Zustand + React Query 역할 분리

```
┌─────────────────────────────────────────────────────┐
│               상태 관리 역할 분리                        │
│                                                       │
│  Zustand (UI 상태)          React Query (서버 상태)    │
│  ┌───────────────────┐     ┌───────────────────────┐ │
│  │ selectedTodoId    │────▶│ useTodo(id)           │ │
│  │ isOpen            │     │ → API 호출            │ │
│  │                   │     │ → 캐싱                │ │
│  │ "어떤 Todo를      │     │ "해당 Todo의          │ │
│  │  보고 있는가?"    │     │  실제 데이터는?"      │ │
│  └───────────────────┘     └───────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 의존성 흐름

```
pages/TodoPage
    ├── widgets/TodoList                  ✅ pages → widgets (정방향)
    │       ├── entities/TodoCard         ✅ widgets → entities (정방향)
    │       └── entities/useTodoDetailStore  ✅ widgets → entities (정방향)
    └── widgets/TodoDetailPanel           ✅ pages → widgets (정방향)
            ├── entities/useTodoDetailStore  ✅ widgets → entities (정방향)
            ├── entities/useTodo             ✅ widgets → entities (정방향)
            └── shared/Spinner               ✅ widgets → shared (정방향)

두 위젯은 서로 import하지 않음 → Zustand 스토어(entities)를 통해 간접 통신
```

### 데이터 흐름

```
[사용자 카드 클릭]
    ↓
[TodoList] - toggleDetail(todo.id) 호출
    ↓
[useTodoDetailStore] - selectedTodoId 설정, isOpen: true
    ↓ Zustand 상태 변경 → 구독 중인 컴포넌트 리렌더
[TodoDetailPanel] - selectedTodoId 읽기
    ↓
[useTodo(selectedTodoId)] - React Query로 API 조회
    ↓ GET /todos/{id}
[API 응답] - Todo 상세 데이터
    ↓
[패널 UI 렌더링] - 상세 정보 표시
```

### Zustand 스토어 설계

```typescript
interface TodoDetailState {
  selectedTodoId: number | null;  // 선택된 Todo ID
  isOpen: boolean;                // 패널 열림 여부

  openDetail: (id: number) => void;    // 패널 열기
  closeDetail: () => void;             // 패널 닫기
  toggleDetail: (id: number) => void;  // 토글 (핵심 액션)
}
```

**`set()` 함수 두 가지 패턴:**

```typescript
// 1. 단순 값 설정 (shallow merge)
openDetail: (id) => set({ selectedTodoId: id, isOpen: true })

// 2. 현재 상태 기반 조건부 업데이트
toggleDetail: (id) => set((state) => {
  if (state.selectedTodoId === id && state.isOpen) {
    return { selectedTodoId: null, isOpen: false };
  }
  return { selectedTodoId: id, isOpen: true };
})
```

### 파일 구조 변경

```
src/
├── entities/todo/
│   ├── model/
│   │   └── useTodoDetailStore.ts   # [생성] Zustand 스토어
│   └── index.ts                    # [수정] 신규 export 추가
│
├── entities/todo/ui/
│   └── TodoCard.tsx                # [수정] onClick, isActive props 추가
│
├── widgets/todo-detail-panel/      # [생성] 신규 위젯
│   ├── ui/TodoDetailPanel.tsx      # [생성] 사이드 패널 컴포넌트
│   └── index.ts                    # [생성] Barrel Export
│
├── widgets/todo-list/
│   └── ui/TodoList.tsx             # [수정] 클릭 핸들러 연결
│
└── pages/todo/
    └── ui/TodoPage.tsx             # [수정] TodoDetailPanel 추가
```

---

## 구현 순서

### Step 1: Zustand 설치
```bash
npm install zustand
```

### Step 2: Zustand 스토어 생성
`src/entities/todo/model/useTodoDetailStore.ts` 생성
- `selectedTodoId`, `isOpen` 상태
- `openDetail`, `closeDetail`, `toggleDetail` 액션

### Step 3: entities barrel export 업데이트
`src/entities/todo/index.ts`에 `useTodoDetailStore` export 추가

### Step 4: TodoCard에 클릭/활성 props 추가
`src/entities/todo/ui/TodoCard.tsx` 수정
- `onClick?: () => void` — 카드 클릭 이벤트
- `isActive?: boolean` — 선택 시 시각적 강조
- optional props로 하위 호환성 유지

### Step 5: 사이드 패널 widget 생성
`src/widgets/todo-detail-panel/` 디렉토리 생성
- `useTodoDetailStore`에서 UI 상태 읽기
- `useTodo(selectedTodoId)`로 서버 데이터 조회
- 슬라이드 애니메이션 (Tailwind `translate-x` + `transition`)
- 오버레이 + 닫기 버튼

### Step 6: TodoList에서 클릭 핸들러 연결
`src/widgets/todo-list/ui/TodoList.tsx` 수정
- `useTodoDetailStore`에서 `toggleDetail`, `selectedTodoId` 가져오기
- 각 TodoCard에 `onClick`, `isActive` props 전달

### Step 7: TodoPage에 패널 조합
`src/pages/todo/ui/TodoPage.tsx` 수정
- `TodoDetailPanel` 위젯 추가 (오버레이 방식이므로 레이아웃 변경 없음)

---

## 검증 방법

1. **개발 서버 실행**: `npm run dev`
2. **카드 클릭**: Todo 카드 클릭 시 사이드 패널 슬라이드 인
3. **상세 정보 표시**: 내용, 상태 뱃지, 작성자, ID 표시
4. **토글 동작**: 같은 카드 재클릭 시 패널 닫힘, 다른 카드 클릭 시 전환
5. **닫기 동작**: ✕ 버튼, 오버레이 클릭으로 패널 닫힘
6. **시각적 강조**: 선택된 카드 파란 테두리/배경
7. **빌드 검증**: `npm run build`로 타입 에러 없음 확인
8. **린트 검증**: `npm run lint`로 규칙 준수 확인

---

## FSD 패턴 핵심 포인트

### Cross-Widget 통신 패턴

**문제 상황**:
- `TodoList`(widget)에서 카드 클릭 시 `TodoDetailPanel`(widget)이 열려야 함
- 같은 레이어의 위젯끼리는 직접 import할 수 없음 (FSD 규칙)

**해결 방법**:
- 공유 상태를 하위 레이어인 `entities`에 Zustand 스토어로 배치
- 각 위젯이 독립적으로 스토어를 구독
- `pages` 레이어에서 두 위젯을 조합

```typescript
// ✅ 올바른 방식 - entities 스토어를 통한 간접 통신
// widgets/TodoList → entities/useTodoDetailStore (쓰기)
// widgets/TodoDetailPanel → entities/useTodoDetailStore (읽기)
// pages/TodoPage에서 두 위젯 조합

// ❌ 잘못된 방식 - 위젯 간 직접 import
// widgets/TodoDetailPanel에서 widgets/TodoList import (FSD 위반)
```

### Zustand가 Provider 없이 동작하는 이유

React Context는 Provider로 감싸야 하위 컴포넌트에서 접근 가능합니다. 반면 Zustand는 **모듈 스코프 싱글톤**으로 동작하여, import만 하면 어디서든 같은 스토어 인스턴스에 접근합니다. 이는 FSD 구조에서 특히 유용합니다 — Provider 위치를 고민할 필요 없이, 적절한 레이어에 스토어를 배치하고 barrel export로 노출하면 됩니다.
