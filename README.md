# My Task Manager — Next.js + Supabase

대학생 과제와 방문자 방명록을 Supabase 데이터베이스에 저장하는 MVP입니다. 이메일 회원가입 후에는 각자 자신의 과제만 보고 관리합니다.

## 1. 설치

```bash
npm install
```

## 2. Supabase 설정

Supabase 프로젝트의 SQL Editor에서 `supabase.sql` 전체를 실행하세요. 기존 `tasks` 테이블이 있다면 사용자별 접근 권한을 위한 `user_id` 열과 RLS 정책을 추가합니다. 이어서 `.env.local`에 프로젝트 URL과 publishable key를 입력합니다.

```text
NEXT_PUBLIC_SUPABASE_URL=https://프로젝트ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 3. 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 주의

방명록을 포함한 데이터는 현재 공개 읽기·쓰기 정책으로 동작합니다. 실서비스에서는 로그인, 사용자별 과제 권한, 스팸 방지 기능을 추가하세요.

과제는 이메일 로그인한 사용자에게만 보이며, `proxy.js`가 Supabase 세션 쿠키를 갱신합니다. Supabase Auth에서 이메일 인증을 켠 경우, 가입 메일의 링크를 먼저 열어야 로그인할 수 있습니다.
