# 정감 컨설팅 홈페이지

TanStack Start + React + Supabase(Lovable Cloud) 기반의 회계 사무소 홈페이지 및 관리자 CMS.

## 기술 스택

- **Frontend**: React 19, TanStack Start, TanStack Router, Tailwind CSS v4
- **Backend**: Supabase (Lovable Cloud) — Postgres, Auth, RLS
- **Build**: Vite 7
- **Deploy**: Cloudflare Workers (edge SSR)

## 로컬 개발 환경

### 1. 사전 요구사항

- Node.js 18+ 또는 Bun 1.0+
- npm / bun / pnpm 중 하나

### 2. 설치

```bash
# 저장소 클론 후
npm install
# 또는
bun install
```

### 3. 환경 변수 설정

`.env` 파일은 Lovable Cloud에서 자동으로 관리됩니다.
로컬에서 직접 실행할 경우 `.env.example`을 복사하여 `.env`를 생성하세요:

```bash
cp .env.example .env
```

필요한 값:

| 변수 | 설명 |
|------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable 키 |
| `VITE_SUPABASE_PROJECT_ID` | Supabase 프로젝트 ID |
| `SUPABASE_URL` | (SSR용) 동일한 URL |
| `SUPABASE_PUBLISHABLE_KEY` | (SSR용) 동일한 키 |

### 4. 개발 서버 실행

```bash
npm run dev
```

→ `http://localhost:8080` (또는 콘솔에 표시된 포트)에서 접속.

### 5. 빌드 & 미리보기

```bash
npm run build
npm run preview
```

## 관리자 페이지

### 접속 경로

- 로그인: `/admin`
- 대시보드: `/admin/dashboard`

### 관리자 계정 생성

1. **사용자 생성**: Lovable Cloud → Users 탭에서 이메일/비밀번호로 사용자 생성 (또는 SQL Editor에서)
2. **관리자 권한 부여**: 데이터베이스에서 다음 SQL 실행

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<생성된-user-uuid>', 'admin');
```

3. `/admin`에서 해당 계정으로 로그인

### 관리 가능한 콘텐츠

- 홈(Hero, 메시지)
- 주요사례
- 방송출연 영상
- 시뮬레이터 가격
- 서비스 항목
- 진행 절차
- 계약 관련 안내
- 연락처 정보

## 프로젝트 구조

```
src/
├── routes/              # 파일 기반 라우팅 (TanStack Router)
│   ├── __root.tsx       # 루트 레이아웃
│   ├── index.tsx        # 홈 (/)
│   ├── services.tsx     # 서비스
│   ├── cases.tsx        # 사례
│   ├── simulator.tsx    # 견적 시뮬레이터
│   ├── contract.tsx     # 계약
│   ├── contact.tsx      # 연락처
│   ├── process.tsx      # 진행절차
│   ├── admin.index.tsx  # 관리자 로그인
│   └── admin.dashboard.tsx  # 관리자 대시보드
├── components/          # 공통 컴포넌트
├── hooks/
│   ├── use-auth.tsx           # 인증 훅
│   └── use-site-content.tsx   # CMS 콘텐츠 훅
├── integrations/supabase/     # Supabase 클라이언트 (자동 생성)
└── styles.css           # Tailwind v4 + 디자인 토큰
```

## 데이터베이스 스키마

| 테이블 | 용도 |
|--------|------|
| `site_content` | CMS 콘텐츠 (section_key + JSONB content) |
| `user_roles` | 사용자 역할 (admin / moderator / user) |

모든 테이블에 RLS 적용:
- `site_content`: 누구나 읽기 가능, 관리자만 쓰기 가능
- `user_roles`: `has_role()` 함수로 권한 체크

## 트러블슈팅

**`npm run dev` 실행 시 환경 변수 에러**
→ `.env` 파일이 프로젝트 루트에 있는지, 필요한 모든 변수가 정의되어 있는지 확인.

**관리자 로그인 후 "접근 권한 없음" 표시**
→ `user_roles` 테이블에 해당 user_id로 `admin` role이 등록되어 있는지 확인.

**관리자 페이지에서 콘텐츠 저장 실패**
→ 브라우저 콘솔에서 RLS 에러 확인. user_roles에 admin 권한이 있는지 재확인.
