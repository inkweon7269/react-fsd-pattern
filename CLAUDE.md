# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Type check and build for production
npm run lint      # Run ESLint
npm run format    # Format code with Prettier
```

## Architecture

This project uses **Feature-Sliced Design (FSD)** architecture with strict unidirectional dependencies.

### Layer Hierarchy (top to bottom)

```
app → pages → widgets → features → entities → shared
```

Upper layers can only import from lower layers. Never import upward.

### Project Structure

```
src/
├── app/           # App config, providers (QueryProvider)
├── pages/         # Route pages (compose widgets)
├── widgets/       # Independent UI blocks with own state
├── features/      # User interaction logic (forms, actions)
├── entities/      # Business domain models (todo: api, model, ui)
└── shared/        # Reusable utilities (baseApi, Spinner)
```

### Key Patterns

**Barrel Exports**: Each slice exposes public API via `index.ts`. Always import from barrel, not internal paths.
```typescript
// ✅ Correct
import { useTodos, TodoCard } from "@/entities/todo";

// ❌ Wrong
import { useTodos } from "@/entities/todo/model/useTodos";
```

**Path Alias**: Use `@/` for absolute imports (configured in tsconfig.json).

**Segments**: Each entity/widget has `api/`, `model/`, `ui/` segments for separation of concerns.

**Query Keys**: React Query keys follow hierarchical pattern in `todoKeys` object for cache management.

**Mutations**: Use `useMutation` with cache invalidation via `queryClient.invalidateQueries()`. Mutation hooks are in `model/useTodoMutations.ts`.

## Tech Stack

- React 19 + TypeScript
- Vite
- TanStack React Query
- Axios
- Tailwind CSS v4

## Documentation

See `docs/FSD-PATTERN-GUIDE.md` for detailed FSD patterns and conventions used in this project.
