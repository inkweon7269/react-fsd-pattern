# Todo 추가 기능 구현 체크리스트

## 개요
- **기능**: Todo 추가 기능
- **API**: `POST /todos/add`
- **아키텍처**: FSD (Feature-Sliced Design)

---

## 구현 체크리스트

### Step 1: entities/todo - 타입 정의
- [ ] `src/entities/todo/model/types.ts` 수정
  - [ ] `CreateTodoRequest` 인터페이스 추가
    ```typescript
    export interface CreateTodoRequest {
      todo: string;
      completed: boolean;
      userId: number;
    }
    ```

### Step 2: entities/todo - API 함수
- [ ] `src/entities/todo/api/todoApi.ts` 수정
  - [ ] `CreateTodoRequest` 타입 import 추가
  - [ ] `createTodo` 함수 추가
    ```typescript
    createTodo: async (request: CreateTodoRequest): Promise<Todo> => {
      const { data } = await baseApi.post("/todos/add", request);
      return data;
    },
    ```

### Step 3: entities/todo - Mutation 훅
- [ ] `src/entities/todo/model/useTodoMutations.ts` 생성
  - [ ] `useMutation`, `useQueryClient` import
  - [ ] `todoApi` import
  - [ ] `todoKeys` import
  - [ ] `CreateTodoRequest` 타입 import
  - [ ] `useCreateTodo` 훅 구현
    - [ ] `mutationFn`: `todoApi.createTodo` 호출
    - [ ] `onSuccess`: `todoKeys.lists()` 캐시 무효화

### Step 4: entities/todo - Barrel Export
- [ ] `src/entities/todo/index.ts` 수정
  - [ ] `useCreateTodo` export 추가
  - [ ] `CreateTodoRequest` 타입 export 추가

### Step 5: features/todo-add - 폼 컴포넌트
- [ ] `src/features/todo-add/` 디렉토리 생성
- [ ] `src/features/todo-add/ui/TodoAddForm.tsx` 생성
  - [ ] `useState` 로 입력 상태 관리
  - [ ] `useCreateTodo` 훅 사용
  - [ ] `handleSubmit` 함수 구현
    - [ ] 빈 문자열 체크
    - [ ] `mutate` 호출
    - [ ] 성공 시 입력 필드 초기화
  - [ ] UI 구현
    - [ ] 텍스트 입력 필드
    - [ ] 추가 버튼
    - [ ] 로딩 상태 표시
    - [ ] 버튼 비활성화 조건
- [ ] `src/features/todo-add/index.ts` 생성
  - [ ] `TodoAddForm` export

### Step 6: widgets/todo-list - 통합
- [ ] `src/widgets/todo-list/ui/TodoList.tsx` 수정
  - [ ] `TodoAddForm` import 추가
  - [ ] 목록 상단에 `<TodoAddForm />` 배치

---

## 검증 체크리스트

### 기능 테스트
- [ ] 폼이 목록 상단에 표시되는가?
- [ ] 텍스트 입력이 정상 동작하는가?
- [ ] 빈 입력 시 버튼이 비활성화 되는가?
- [ ] 추가 버튼 클릭 시 API 호출이 발생하는가?
- [ ] 로딩 중 버튼 텍스트가 "추가 중..."으로 변경되는가?
- [ ] 로딩 중 입력 필드가 비활성화 되는가?
- [ ] 성공 후 입력 필드가 초기화 되는가?
- [ ] 성공 후 목록이 자동 갱신되는가?

### 기술 검증
- [ ] `npm run dev` - 개발 서버 정상 실행
- [ ] `npm run build` - 타입 에러 없음
- [ ] `npm run lint` - 린트 에러 없음
- [ ] 네트워크 탭에서 POST 요청 확인
- [ ] 콘솔에 에러 없음

### FSD 패턴 검증
- [ ] 의존성 방향 준수 (entities → features → widgets)
- [ ] Barrel Export 패턴 적용
- [ ] 절대 경로(`@/`) 사용

---

## 파일 변경 요약

| 상태 | 파일 경로 |
|:----:|----------|
| 수정 | `src/entities/todo/model/types.ts` |
| 수정 | `src/entities/todo/api/todoApi.ts` |
| 생성 | `src/entities/todo/model/useTodoMutations.ts` |
| 수정 | `src/entities/todo/index.ts` |
| 생성 | `src/features/todo-add/ui/TodoAddForm.tsx` |
| 생성 | `src/features/todo-add/index.ts` |
| 수정 | `src/widgets/todo-list/ui/TodoList.tsx` |

---

## 완료 기준

- [ ] 모든 구현 체크리스트 완료
- [ ] 모든 검증 체크리스트 통과
- [ ] 코드 리뷰 완료
- [ ] 문서 업데이트 (필요시 FSD-PATTERN-GUIDE.md)
