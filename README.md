# My Task Manager — Next.js + Supabase

대학생 과제를 데이터베이스에 저장하는 MVP입니다.

## 1. 설치

```bash
npm install
```

## 2. Supabase 프로젝트 만들기

Supabase에서 새 프로젝트를 만든 후 SQL Editor에서 `supabase.sql` 전체를 실행합니다.

## 3. 환경변수

`.env.local.example`을 복사해서 `.env.local`로 이름을 바꿉니다.

```bash
cp .env.local.example .env.local
```

그리고 Supabase 프로젝트의 URL과 anon/publishable key를 입력합니다.

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 4. 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 주의

현재 버전은 과제 수업용 MVP라 로그인 없이 누구나 같은 tasks 테이블을 읽고/추가/수정/삭제할 수 있게 되어 있습니다.

실서비스로 만들 때는 Supabase Auth와 사용자별 Row Level Security(RLS)를 추가해야 합니다.
