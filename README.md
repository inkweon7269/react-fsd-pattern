# React FSD Todo App

Feature-Sliced Design(FSD) 아키텍처를 적용한 React Todo 애플리케이션입니다.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** - 빌드 도구
- **TanStack React Query** - 서버 상태 관리
- **Axios** - HTTP 클라이언트
- **Tailwind CSS v4** - 스타일링
- **DummyJSON** - Mock API 백엔드

## Quick Start

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview

# 린트 검사
npm run lint

# 코드 포맷팅
npm run format

# 포맷팅 검사 (수정 없이)
npm run format:check
```

---

## Feature-Sliced Design (FSD) 아키텍처

### FSD란?

FSD는 프론트엔드 애플리케이션을 **계층(Layer)**과 **슬라이스(Slice)**로 구조화하는 아키텍처 방법론입니다. 확장 가능하고 유지보수하기 쉬운 코드베이스를 만드는 것이 목표입니다.

### 핵심 원칙

1. **단방향 의존성** - 상위 계층은 하위 계층만 import 가능
2. **캡슐화** - `index.ts`를 통한 Public API 노출
3. **세그먼트 분리** - `api/`, `model/`, `ui/` 역할 구분

### 계층 구조

```
┌─────────────────────────────────────────────────────┐
│                       App                           │
│             (앱 설정, 프로바이더, 라우팅)             │
└──────────────────────┬──────────────────────────────┘
                       │ imports
                       ▼
┌─────────────────────────────────────────────────────┐
│                      Pages                          │
│               (라우팅 대상 페이지)                   │
└──────────────────────┬──────────────────────────────┘
                       │ imports
                       ▼
┌─────────────────────────────────────────────────────┐
│                     Widgets                         │
│             (독립적인 복합 UI 블록)                  │
└──────────────────────┬──────────────────────────────┘
                       │ imports
                       ▼
┌─────────────────────────────────────────────────────┐
│                    Features                         │
│              (사용자 인터랙션 로직)                  │
└──────────────────────┬──────────────────────────────┘
                       │ imports
                       ▼
┌─────────────────────────────────────────────────────┐
│                    Entities                         │
│            (비즈니스 도메인 엔티티)                  │
└──────────────────────┬──────────────────────────────┘
                       │ imports
                       ▼
┌─────────────────────────────────────────────────────┐
│                     Shared                          │
│         (재사용 가능한 유틸리티, 공통 UI)            │
└─────────────────────────────────────────────────────┘
```

**의존성 방향**: `app` → `pages` → `widgets` → `features` → `entities` → `shared`

---

## 프로젝트 구조

```
src/
├── app/                          # App 계층
│   ├── App.tsx                   # 메인 앱 컴포넌트
│   └── providers/
│       └── QueryProvider.tsx     # React Query 프로바이더
│
├── pages/                        # Pages 계층
│   └── todo/
│       ├── index.ts              # Public API (Barrel Export)
│       └── ui/
│           └── TodoPage.tsx
│
├── widgets/                      # Widgets 계층
│   └── todo-list/
│       ├── index.ts
│       └── ui/
│           └── TodoList.tsx      # 페이지네이션 포함 Todo 목록
│
├── features/                     # Features 계층
│   ├── todo-add/
│   │   ├── index.ts
│   │   └── ui/
│   │       └── TodoAddForm.tsx   # Todo 추가 폼
│   └── todo-delete/
│       ├── index.ts
│       └── ui/
│           └── TodoDeleteButton.tsx  # Todo 삭제 버튼
│
├── entities/                     # Entities 계층
│   └── todo/
│       ├── index.ts              # Public API (Barrel Export)
│       ├── api/
│       │   └── todoApi.ts        # Todo API 함수
│       ├── model/
│       │   ├── types.ts          # 타입 정의
│       │   ├── useTodos.ts       # Query 훅 + Query Keys
│       │   └── useTodoMutations.ts  # Mutation 훅
│       └── ui/
│           └── TodoCard.tsx      # Todo 카드 컴포넌트
│
├── shared/                       # Shared 계층
│   ├── index.ts                  # Public API (Barrel Export)
│   ├── api/
│   │   └── baseApi.ts            # Axios 인스턴스
│   └── ui/
│       └── Spinner.tsx           # 공통 로딩 컴포넌트
│
└── main.tsx                      # 앱 진입점
```

### 각 계층 역할

| 계층 | 역할 | 예시 |
|------|------|------|
| **Shared** | 비즈니스 로직과 무관한 범용 코드 | `baseApi`, `Spinner` |
| **Entities** | 비즈니스 도메인 엔티티 정의 | `todo` (타입, API, 훅, 카드) |
| **Features** | 사용자 인터랙션 로직 | `todo-add`, `todo-delete` |
| **Widgets** | 독립적인 복합 UI 블록 | `TodoList` (페이지네이션 포함) |
| **Pages** | 라우팅 대상 페이지 | `TodoPage` |
| **App** | 앱 설정, 프로바이더, 글로벌 스타일 | `QueryProvider`, `App` |

---

## 주요 패턴

### 1. Barrel Export 패턴

각 슬라이스는 `index.ts`를 통해 Public API만 외부에 노출합니다.

```typescript
// entities/todo/index.ts
export { TodoCard } from "./ui/TodoCard";
export { useTodos, useTodo, todoKeys } from "./model/useTodos";
export { useCreateTodo, useDeleteTodo } from "./model/useTodoMutations";
export type { Todo, TodosResponse, GetTodosParams } from "./model/types";
```

**올바른 Import:**
```typescript
// ✅ Barrel을 통한 import
import { useTodos, TodoCard } from "@/entities/todo";
```

**잘못된 Import:**
```typescript
// ❌ 내부 경로 직접 접근 금지
import { useTodos } from "@/entities/todo/model/useTodos";
```

### 2. Query Keys 패턴

React Query 캐시 키를 계층적으로 관리합니다.

```typescript
// entities/todo/model/useTodos.ts
export const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (params?: GetTodosParams) => [...todoKeys.lists(), params] as const,
  details: () => [...todoKeys.all, "detail"] as const,
  detail: (id: number) => [...todoKeys.details(), id] as const,
};
```

**장점:**
- 선택적 캐시 무효화: `queryClient.invalidateQueries({ queryKey: todoKeys.lists() })`
- 타입 안전성: `as const`로 리터럴 타입 유지
- 일관된 키 관리

### 3. Mutation 패턴

데이터 변경 후 관련 쿼리를 자동으로 무효화합니다.

```typescript
// entities/todo/model/useTodoMutations.ts
export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: todoApi.createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: todoApi.deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
};
```

### 4. 세그먼트 분리

각 슬라이스 내부는 역할에 따라 세그먼트로 분리됩니다.

| 세그먼트 | 역할 | 포함 내용 |
|----------|------|----------|
| `api/` | 외부 통신 | REST API 함수, 엔드포인트 정의 |
| `model/` | 비즈니스 로직 | 타입 정의, 상태 관리 훅, Query Keys |
| `ui/` | 사용자 인터페이스 | React 컴포넌트 |

---

## 의존성 규칙

### 허용되는 Import 방향 (상위 → 하위)

```
app       → pages, widgets, features, entities, shared
pages     → widgets, features, entities, shared
widgets   → features, entities, shared
features  → entities, shared
entities  → shared
```

### 금지되는 Import 방향 (하위 → 상위)

```
shared    → entities, features, widgets, pages, app
entities  → features, widgets, pages, app
features  → widgets, pages, app
widgets   → pages, app
pages     → app
```

### 같은 계층 내 Import

- **Entities 간**: 금지 (순환 의존성 방지)
- **Features 간**: 금지 (각 기능은 독립적)
- **Pages 간**: 금지 (각 페이지는 독립적)
- **Widgets 간**: 가능하지만 주의 필요

---

## Path Alias

`@/`를 사용하여 `src/` 디렉토리에 대한 절대 경로를 사용합니다.

```typescript
import { Spinner } from "@/shared";
import { useTodos, TodoCard } from "@/entities/todo";
import { TodoAddForm } from "@/features/todo-add";
import { TodoList } from "@/widgets/todo-list";
import { TodoPage } from "@/pages/todo";
```

---

## API 백엔드

이 앱은 **DummyJSON** (https://dummyjson.com)을 Mock API 백엔드로 사용합니다.

### 주요 엔드포인트

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/todos` | Todo 목록 조회 |
| GET | `/todos/:id` | 단일 Todo 조회 |
| POST | `/todos/add` | Todo 추가 |
| DELETE | `/todos/:id` | Todo 삭제 |

### API 클라이언트 설정

```typescript
// shared/api/baseApi.ts
import axios from "axios";

export const baseApi = axios.create({
  baseURL: "https://dummyjson.com",
  headers: {
    "Content-Type": "application/json",
  },
});
```

---

## 새 기능 추가 가이드

### 새 Entity 추가 (예: User)

```
entities/
└── user/
    ├── index.ts              # Public API
    ├── api/
    │   └── userApi.ts        # User API 함수
    ├── model/
    │   ├── types.ts          # 타입 정의
    │   └── useUsers.ts       # Query Keys + 훅
    └── ui/
        └── UserCard.tsx      # User 카드 컴포넌트
```

### 새 Feature 추가 (예: Todo 수정)

```
features/
└── todo-edit/
    ├── index.ts              # Public API
    └── ui/
        └── TodoEditForm.tsx  # Todo 수정 폼
```

### 새 Widget 추가 (예: User 목록)

```
widgets/
└── user-list/
    ├── index.ts              # Public API
    └── ui/
        └── UserList.tsx      # 페이지네이션 포함 User 목록
```

---

## 참고 문서

- [FSD 패턴 상세 가이드](./docs/FSD-PATTERN-GUIDE.md) - 한국어 상세 문서
- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
- [TanStack Query 문서](https://tanstack.com/query/latest)

---

## 라이선스

MIT
