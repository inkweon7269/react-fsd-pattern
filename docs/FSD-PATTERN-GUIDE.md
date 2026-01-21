# FSD (Feature-Sliced Design) 패턴 가이드

이 문서는 본 프로젝트에서 사용하는 Feature-Sliced Design 아키텍처 패턴을 설명합니다.

---

## 목차

1. [FSD 패턴 소개](#1-fsd-패턴-소개)
2. [계층 구조 개요](#2-계층-구조-개요)
3. [Shared 계층](#3-shared-계층---재사용-가능한-기반-코드)
4. [Entities 계층](#4-entities-계층---비즈니스-도메인-모델)
5. [Widgets 계층](#5-widgets-계층---독립적인-ui-블록)
6. [Pages 계층](#6-pages-계층---페이지-컴포넌트)
7. [App 계층](#7-app-계층---앱-설정-및-프로바이더)
8. [의존성 규칙 및 베스트 프랙티스](#8-의존성-규칙-및-베스트-프랙티스)

---

## 1. FSD 패턴 소개

### Feature-Sliced Design이란?

Feature-Sliced Design(FSD)은 프론트엔드 애플리케이션을 위한 아키텍처 방법론입니다. 코드를 **계층(Layer)**과 **슬라이스(Slice)**로 구조화하여 확장 가능하고 유지보수하기 쉬운 코드베이스를 만듭니다.

### 핵심 원칙

#### 1. 단방향 의존성 (Unidirectional Dependencies)
- 상위 계층은 하위 계층을 import할 수 있지만, 그 반대는 불가능합니다.
- 의존성 방향: `app` → `pages` → `widgets` → `entities` → `shared`

#### 2. 캡슐화 (Encapsulation)
- 각 모듈은 **Public API**만 외부에 노출합니다.
- `index.ts` (Barrel Export)를 통해 명시적으로 공개할 항목을 정의합니다.
- 내부 구현은 외부에서 직접 접근할 수 없습니다.

#### 3. 세그먼트 분리 (Segment Separation)
- 각 슬라이스 내부는 역할에 따라 세그먼트로 분리됩니다:
  - `api/` - API 호출 로직
  - `model/` - 타입 정의, 상태 관리, 비즈니스 로직
  - `ui/` - UI 컴포넌트

---

## 2. 계층 구조 개요

### 의존성 다이어그램

```
┌─────────────────────────────────────────────────────┐
│                      App                            │
│            (앱 설정, 프로바이더, 라우팅)              │
└──────────────────────┬──────────────────────────────┘
                       │ imports
                       ▼
┌─────────────────────────────────────────────────────┐
│                     Pages                           │
│              (라우팅 대상 페이지)                    │
└──────────────────────┬──────────────────────────────┘
                       │ imports
                       ▼
┌─────────────────────────────────────────────────────┐
│                    Widgets                          │
│            (독립적인 복합 UI 블록)                   │
└──────────────────────┬──────────────────────────────┘
                       │ imports
                       ▼
┌─────────────────────────────────────────────────────┐
│                   Entities                          │
│           (비즈니스 도메인 엔티티)                   │
└──────────────────────┬──────────────────────────────┘
                       │ imports
                       ▼
┌─────────────────────────────────────────────────────┐
│                    Shared                           │
│        (재사용 가능한 유틸리티, 공통 UI)             │
└─────────────────────────────────────────────────────┘
```

### 각 계층 요약

| 계층 | 역할 | 예시 |
|------|------|------|
| **Shared** | 재사용 가능한 유틸리티, API 클라이언트, 공통 UI | `baseApi`, `Spinner` |
| **Entities** | 비즈니스 도메인 엔티티 정의 | `todo` (타입, API, 훅, 카드 컴포넌트) |
| **Widgets** | 독립적인 복합 UI 블록 | `TodoList` (페이지네이션 포함) |
| **Pages** | 라우팅 대상이 되는 페이지 컴포넌트 | `TodoPage` |
| **App** | 앱 설정, 프로바이더, 글로벌 스타일 | `QueryProvider`, `App` |

### 프로젝트 폴더 구조

```
src/
├── app/                          # 5. App 계층
│   ├── App.tsx
│   └── providers/
│       └── QueryProvider.tsx
├── entities/                     # 2. Entities 계층
│   └── todo/
│       ├── index.ts              # Public API (Barrel Export)
│       ├── api/
│       │   └── todoApi.ts
│       ├── model/
│       │   ├── types.ts
│       │   └── useTodos.ts
│       └── ui/
│           └── TodoCard.tsx
├── pages/                        # 4. Pages 계층
│   └── todo/
│       ├── index.ts              # Public API (Barrel Export)
│       └── ui/
│           └── TodoPage.tsx
├── shared/                       # 1. Shared 계층
│   ├── index.ts                  # Public API (Barrel Export)
│   ├── api/
│   │   └── baseApi.ts
│   └── ui/
│       └── Spinner.tsx
├── widgets/                      # 3. Widgets 계층
│   └── todo-list/
│       ├── index.ts              # Public API (Barrel Export)
│       └── ui/
│           └── TodoList.tsx
└── main.tsx
```

---

## 3. Shared 계층 - 재사용 가능한 기반 코드

### 목적

- 비즈니스 로직과 무관한 **범용 코드**
- 모든 계층에서 사용 가능한 **공통 유틸리티**
- API 클라이언트, UI 컴포넌트, 헬퍼 함수 등

### 폴더 구조

```
shared/
├── index.ts          # Public API
├── api/
│   └── baseApi.ts    # Axios 인스턴스
└── ui/
    └── Spinner.tsx   # 공통 로딩 컴포넌트
```

### 코드 예시

#### `shared/api/baseApi.ts` - API 클라이언트

```typescript
import axios from "axios";

export const baseApi = axios.create({
  baseURL: "https://dummyjson.com",
  headers: {
    "Content-Type": "application/json",
  },
});
```

> **설명**: Axios 인스턴스를 생성하여 기본 URL과 헤더를 설정합니다. 모든 API 호출에서 이 인스턴스를 재사용합니다.

#### `shared/ui/Spinner.tsx` - 로딩 컴포넌트

```tsx
export const Spinner = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
  </div>
);
```

> **설명**: 로딩 상태에서 사용하는 스피너 컴포넌트입니다. 비즈니스 로직과 무관하므로 Shared 계층에 위치합니다.

### Barrel Export 패턴

#### `shared/index.ts`

```typescript
export { baseApi } from "./api/baseApi";
export { Spinner } from "./ui/Spinner";
```

> **핵심**: `index.ts`를 통해 외부에 공개할 항목만 명시적으로 export합니다. 외부에서는 반드시 이 Public API를 통해서만 접근해야 합니다.

**올바른 import:**
```typescript
import { baseApi, Spinner } from "@/shared";
```

**잘못된 import:**
```typescript
// ❌ 내부 경로 직접 접근 금지
import { baseApi } from "@/shared/api/baseApi";
```

---

## 4. Entities 계층 - 비즈니스 도메인 모델

### 목적

- **비즈니스 도메인 엔티티** 정의
- 타입, API 함수, 상태 관리 훅, 기본 UI 컴포넌트 포함
- 단일 엔티티에 관련된 모든 로직을 캡슐화

### 폴더 구조

```
entities/
└── todo/
    ├── index.ts              # Public API
    ├── api/
    │   └── todoApi.ts        # Todo API 함수
    ├── model/
    │   ├── types.ts          # 타입 정의
    │   └── useTodos.ts       # React Query 훅 + Query Keys
    └── ui/
        └── TodoCard.tsx      # Todo 카드 컴포넌트
```

### 세그먼트 역할

| 세그먼트 | 역할 | 포함 내용 |
|----------|------|----------|
| `api/` | API 호출 | REST API 함수, 엔드포인트 정의 |
| `model/` | 비즈니스 로직 | 타입 정의, 상태 관리 훅, Query Keys |
| `ui/` | UI 컴포넌트 | 엔티티 표시용 기본 컴포넌트 |

### 코드 예시

#### `entities/todo/model/types.ts` - 타입 정의

```typescript
export interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

export interface TodosResponse {
  todos: Todo[];
  total: number;
  skip: number;
  limit: number;
}

export interface GetTodosParams {
  limit?: number;
  skip?: number;
}
```

> **설명**: Todo 도메인의 핵심 타입들을 정의합니다. API 응답 형식과 요청 파라미터 타입을 포함합니다.

#### `entities/todo/api/todoApi.ts` - API 함수

```typescript
import { baseApi } from "@/shared";
import type { TodosResponse, GetTodosParams, Todo } from "@/entities/todo/model/types";

export const todoApi = {
  // 전체 Todo 목록 조회
  getTodos: async (params?: GetTodosParams): Promise<TodosResponse> => {
    const { data } = await baseApi.get("/todos", { params });
    return data;
  },

  // 단일 Todo 조회
  getTodoById: async (id: number): Promise<Todo> => {
    const { data } = await baseApi.get(`/todos/${id}`);
    return data;
  },

  // 특정 유저의 Todo 목록 조회
  getTodosByUserId: async (userId: number): Promise<TodosResponse> => {
    const { data } = await baseApi.get(`/todos/user/${userId}`);
    return data;
  },
};
```

> **설명**: `shared`의 `baseApi`를 사용하여 Todo 관련 API 함수를 정의합니다. 객체 형태로 관련 함수들을 그룹화합니다.

#### `entities/todo/model/useTodos.ts` - Query Keys + 훅

```typescript
import { useQuery } from "@tanstack/react-query";
import type { GetTodosParams } from "@/entities/todo/model/types";
import { todoApi } from "@/entities/todo/api/todoApi";

// Query Keys - 일관된 키 관리
export const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (params?: GetTodosParams) => [...todoKeys.lists(), params] as const,
  details: () => [...todoKeys.all, "detail"] as const,
  detail: (id: number) => [...todoKeys.details(), id] as const,
  byUser: (userId: number) => [...todoKeys.all, "user", userId] as const,
};

// Todo 목록 조회 훅
export const useTodos = (params?: GetTodosParams) => {
  return useQuery({
    queryKey: todoKeys.list(params),
    queryFn: () => todoApi.getTodos(params),
  });
};

// 단일 Todo 조회 훅
export const useTodo = (id: number) => {
  return useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: () => todoApi.getTodoById(id),
    enabled: !!id, // id가 있을 때만 실행
  });
};

// 특정 유저의 Todo 목록 조회 훅
export const useTodosByUser = (userId: number) => {
  return useQuery({
    queryKey: todoKeys.byUser(userId),
    queryFn: () => todoApi.getTodosByUserId(userId),
    enabled: !!userId,
  });
};
```

### Query Keys 패턴 상세 설명

```typescript
export const todoKeys = {
  all: ["todos"] as const,                                    // 모든 Todo 관련 쿼리
  lists: () => [...todoKeys.all, "list"] as const,           // 목록 쿼리들
  list: (params?) => [...todoKeys.lists(), params] as const, // 특정 파라미터 목록
  details: () => [...todoKeys.all, "detail"] as const,       // 상세 쿼리들
  detail: (id) => [...todoKeys.details(), id] as const,      // 특정 ID 상세
  byUser: (userId) => [...todoKeys.all, "user", userId],     // 유저별 목록
};
```

**Query Keys 패턴의 장점:**

1. **계층적 구조**: `["todos"]` → `["todos", "list"]` → `["todos", "list", { limit: 10 }]`
2. **선택적 무효화**:
   - `queryClient.invalidateQueries({ queryKey: todoKeys.all })` - 모든 Todo 쿼리 무효화
   - `queryClient.invalidateQueries({ queryKey: todoKeys.lists() })` - 목록만 무효화
3. **타입 안전성**: `as const`로 리터럴 타입 유지

#### `entities/todo/ui/TodoCard.tsx` - UI 컴포넌트

```tsx
import type { Todo } from "@/entities/todo/model/types";

interface TodoCardProps {
  todo: Todo;
}

export const TodoCard = ({ todo }: TodoCardProps) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={todo.completed} readOnly className="mt-1 h-4 w-4" />
        <div className="flex-1">
          <p className={`${todo.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
            {todo.todo}
          </p>
          <span className="text-xs text-gray-500">User #{todo.userId}</span>
        </div>
      </div>
    </div>
  );
};
```

> **설명**: 단일 Todo를 표시하는 기본 컴포넌트입니다. 엔티티 계층의 UI는 **프레젠테이션 로직만** 포함하고, 상태 관리나 데이터 페칭은 하지 않습니다.

### Barrel Export

#### `entities/todo/index.ts`

```typescript
export { TodoCard } from "./ui/TodoCard";
export { useTodos, useTodo, useTodosByUser, todoKeys } from "./model/useTodos";
export type { Todo, TodosResponse, GetTodosParams } from "./model/types";
```

> **핵심**: 외부에서 필요한 것만 export합니다. `todoApi`는 직접 노출하지 않고, 훅을 통해서만 사용하도록 캡슐화합니다.

---

## 5. Widgets 계층 - 독립적인 UI 블록

### 목적

- **독립적으로 동작하는 복합 UI 블록**
- 여러 entities와 shared 컴포넌트를 조합
- 자체 상태와 로직을 가질 수 있음

### 폴더 구조

```
widgets/
└── todo-list/
    ├── index.ts              # Public API
    └── ui/
        └── TodoList.tsx      # 페이지네이션 포함 Todo 목록
```

### 코드 예시

#### `widgets/todo-list/ui/TodoList.tsx`

```tsx
import { useState } from "react";
import { useTodos, TodoCard } from "@/entities/todo";
import { Spinner } from "@/shared";

export const TodoList = () => {
  const [page, setPage] = useState(0);
  const limit = 10;

  const { data, isLoading, isError, error } = useTodos({
    limit,
    skip: page * limit,
  });

  if (isLoading) return <Spinner />;

  if (isError) {
    return <div className="p-4 text-red-500">에러가 발생했습니다: {error.message}</div>;
  }

  const totalPages = Math.ceil((data?.total ?? 0) / limit);

  return (
    <div className="space-y-4">
      {/* Todo 목록 */}
      <div className="space-y-2">
        {data?.todos.map((todo) => (
          <TodoCard key={todo.id} todo={todo} />
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between pt-4">
        <span className="text-sm text-gray-500">
          총 {data?.total}개 중 {page * limit + 1}-{Math.min((page + 1) * limit, data?.total ?? 0)}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            이전
          </button>
          <span className="px-3 py-1">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};
```

### Widget의 특징

1. **독립성**: 페이지에 드롭인하여 바로 사용 가능
2. **자체 상태**: 페이지네이션 상태(`page`)를 내부적으로 관리
3. **조합**: `entities/todo`의 `useTodos`와 `TodoCard`, `shared`의 `Spinner` 조합
4. **완전한 기능**: 로딩, 에러, 데이터 표시, 페이지네이션까지 완전한 기능 제공

### Barrel Export

#### `widgets/todo-list/index.ts`

```typescript
export { TodoList } from "./ui/TodoList";
```

---

## 6. Pages 계층 - 페이지 컴포넌트

### 목적

- **라우팅의 대상이 되는 페이지**
- Widgets를 배치하고 레이아웃 구성
- 페이지별 메타데이터, 타이틀 등 관리

### 폴더 구조

```
pages/
└── todo/
    ├── index.ts              # Public API
    └── ui/
        └── TodoPage.tsx
```

### 코드 예시

#### `pages/todo/ui/TodoPage.tsx`

```tsx
import { TodoList } from "@/widgets/todo-list";

export const TodoPage = () => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📝 할 일 목록</h1>
      <TodoList />
    </div>
  );
};
```

### Page의 특징

1. **심플함**: 복잡한 로직 없이 widgets를 배치
2. **레이아웃**: 페이지 전체 레이아웃과 스타일링 담당
3. **제목/메타데이터**: 페이지 제목, SEO 메타데이터 등 관리

### Barrel Export

#### `pages/todo/index.ts`

```typescript
export { TodoPage } from "./ui/TodoPage";
```

---

## 7. App 계층 - 앱 설정 및 프로바이더

### 목적

- **앱 전역 설정**
- 프로바이더(Context, QueryClient 등) 구성
- 라우팅 설정
- 글로벌 스타일

### 폴더 구조

```
app/
├── App.tsx                   # 메인 앱 컴포넌트
└── providers/
    └── QueryProvider.tsx     # React Query 프로바이더
```

### 코드 예시

#### `app/providers/QueryProvider.tsx`

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5분
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
```

> **설명**: React Query의 QueryClient를 설정하고 제공합니다. `useState`로 인스턴스를 생성하여 리렌더링 시에도 동일한 인스턴스를 유지합니다.

#### `app/App.tsx`

```tsx
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
```

### App 계층의 역할

1. **프로바이더 조합**: 여러 프로바이더를 적절한 순서로 중첩
2. **라우팅**: React Router 등을 사용한 라우팅 설정 (확장 시)
3. **글로벌 설정**: 전역 상태, 테마, 국제화 등

---

## 8. 의존성 규칙 및 베스트 프랙티스

### Import 방향 규칙

```
✅ 허용되는 방향 (상위 → 하위)
app       → pages, widgets, entities, shared
pages     → widgets, entities, shared
widgets   → entities, shared
entities  → shared

❌ 금지되는 방향 (하위 → 상위)
shared    → entities, widgets, pages, app
entities  → widgets, pages, app
widgets   → pages, app
pages     → app
```

### 같은 계층 내 Import

- **Entities 간**: 금지 (순환 의존성 방지)
- **Pages 간**: 금지 (각 페이지는 독립적)
- **Widgets 간**: 가능하지만 주의 필요

### Path Alias 사용법

`tsconfig.json` 또는 `vite.config.ts`에서 설정:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**사용 예시:**
```typescript
import { Spinner } from "@/shared";
import { useTodos, TodoCard } from "@/entities/todo";
import { TodoList } from "@/widgets/todo-list";
import { TodoPage } from "@/pages/todo";
```

### Barrel Export 규칙

#### Barrel Export란?

**Barrel Export**는 여러 모듈의 export를 하나의 `index.ts` 파일에서 모아서 다시 내보내는 패턴입니다. 마치 여러 물건을 하나의 "배럴(통)"에 담아서 제공하는 것과 같습니다.

```
entities/todo/
├── index.ts          ← 📦 Barrel (Public API)
├── api/
│   └── todoApi.ts    ← 내부 모듈
├── model/
│   ├── types.ts      ← 내부 모듈
│   └── useTodos.ts   ← 내부 모듈
└── ui/
    └── TodoCard.tsx  ← 내부 모듈
```

`index.ts`가 **유일한 진입점(Entry Point)** 역할을 하며, 외부에서는 이 파일을 통해서만 모듈에 접근합니다.

#### 왜 Barrel Export를 사용하나요?

**1. 캡슐화 (Encapsulation)**
- 내부 구현을 숨기고, 공개할 API만 노출합니다.
- 내부 구조가 변경되어도 외부 코드에 영향을 주지 않습니다.

```typescript
// index.ts에서 공개한 것만 외부에서 사용 가능
export { TodoCard } from "./ui/TodoCard";
export { useTodos } from "./model/useTodos";
// todoApi는 export하지 않음 → 외부에서 직접 사용 불가
```

**2. 깔끔한 Import 경로**
```typescript
// ✅ Barrel Export 사용 - 깔끔함
import { useTodos, TodoCard, Todo } from "@/entities/todo";

// ❌ Barrel Export 미사용 - 복잡함
import { useTodos } from "@/entities/todo/model/useTodos";
import { TodoCard } from "@/entities/todo/ui/TodoCard";
import type { Todo } from "@/entities/todo/model/types";
```

**3. 리팩토링 용이성**
- 내부 파일 구조를 변경해도 `index.ts`만 수정하면 됩니다.
- 외부에서 사용하는 import 경로는 그대로 유지됩니다.

```typescript
// 파일을 model/useTodos.ts → hooks/useTodos.ts로 이동해도
// index.ts만 수정하면 외부 코드는 변경 불필요
export { useTodos } from "./hooks/useTodos"; // 경로만 변경
```

**4. 명시적인 Public API**
- 무엇이 공개되어 있는지 `index.ts`만 보면 한눈에 파악 가능합니다.

#### Barrel Export 작성 방법

**기본 문법:**
```typescript
// entities/todo/index.ts

// 컴포넌트 export
export { TodoCard } from "./ui/TodoCard";

// 훅 export
export { useTodos, useTodo, useTodosByUser, todoKeys } from "./model/useTodos";

// 타입 export (type 키워드 사용)
export type { Todo, TodosResponse, GetTodosParams } from "./model/types";
```

**주의사항:**
- 타입을 export할 때는 `export type`을 사용합니다 (트리 쉐이킹 최적화).
- 내부에서만 사용하는 모듈은 export하지 않습니다.
- `index.ts` 자체는 상대 경로(`./`)로 내부 모듈을 참조합니다.

#### Barrel Export 사용 규칙

1. **각 슬라이스의 루트에 `index.ts` 생성**
2. **외부에 공개할 항목만 export**
3. **내부 구현 상세는 숨김**
4. **외부에서는 반드시 Barrel을 통해 import**

```typescript
// ✅ 올바른 import (Barrel 사용)
import { useTodos, TodoCard } from "@/entities/todo";

// ❌ 잘못된 import (내부 경로 직접 접근)
import { useTodos } from "@/entities/todo/model/useTodos";
```

#### 프로젝트 내 Barrel Export 현황

| 위치 | Barrel 파일 | 공개 항목 |
|------|-------------|----------|
| `shared/` | `index.ts` | `baseApi`, `Spinner` |
| `entities/todo/` | `index.ts` | `TodoCard`, `useTodos`, `useTodo`, `useTodosByUser`, `todoKeys`, `Todo`, `TodosResponse`, `GetTodosParams` |
| `widgets/todo-list/` | `index.ts` | `TodoList` |
| `pages/todo/` | `index.ts` | `TodoPage` |

### 세그먼트 역할 정리

| 세그먼트 | 역할 | 포함 내용 |
|----------|------|----------|
| `api/` | 외부 통신 | REST/GraphQL API 함수, WebSocket 연결 |
| `model/` | 비즈니스 로직 | 타입, 상태 관리, 훅, 유틸리티 함수 |
| `ui/` | 사용자 인터페이스 | React 컴포넌트, 스타일 |
| `lib/` | 헬퍼 함수 | 순수 함수, 변환 로직 (선택적) |
| `config/` | 설정 | 상수, 설정 값 (선택적) |

### 새 엔티티 추가 가이드

예: `user` 엔티티 추가

```
entities/
└── user/
    ├── index.ts              # Public API
    ├── api/
    │   └── userApi.ts        # User API 함수
    ├── model/
    │   ├── types.ts          # User 타입 정의
    │   └── useUsers.ts       # Query Keys + 훅
    └── ui/
        └── UserCard.tsx      # User 카드 컴포넌트
```

**1. 타입 정의** (`model/types.ts`):
```typescript
export interface User {
  id: number;
  username: string;
  email: string;
}
```

**2. API 함수** (`api/userApi.ts`):
```typescript
import { baseApi } from "@/shared";
import type { User } from "@/entities/user/model/types";

export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const { data } = await baseApi.get("/users");
    return data.users;
  },
};
```

**3. Query Keys + 훅** (`model/useUsers.ts`):
```typescript
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/entities/user/api/userApi";

export const userKeys = {
  all: ["users"] as const,
  list: () => [...userKeys.all, "list"] as const,
};

export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: userApi.getUsers,
  });
};
```

**4. Public API** (`index.ts`):
```typescript
export { UserCard } from "./ui/UserCard";
export { useUsers, userKeys } from "./model/useUsers";
export type { User } from "./model/types";
```

---

## 요약

FSD 패턴의 핵심:

1. **계층 구조**: `app` → `pages` → `widgets` → `entities` → `shared`
2. **단방향 의존성**: 상위 계층만 하위 계층을 import
3. **캡슐화**: `index.ts`를 통한 Public API 노출
4. **세그먼트 분리**: `api/`, `model/`, `ui/` 역할 구분
5. **Query Keys 패턴**: 계층적 캐시 키 관리

이 패턴을 따르면 확장 가능하고, 유지보수하기 쉬우며, 팀원 간 일관된 코드 구조를 유지할 수 있습니다.
