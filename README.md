# 개인 홈페이지

Next.js 16(App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4로 만든 개인 홈페이지입니다.
별도 DB 서버 없이 `.data/db.json` 파일에 데이터를 저장하므로 바로 실행할 수 있습니다.

## 실행

```bash
npm run dev     # 개발 서버 (http://localhost:3000)
npm run build   # 프로덕션 빌드
npm run start   # 빌드 결과 실행
```

**처음 가입한 회원이 자동으로 관리자가 됩니다.** 실행 후 가장 먼저 본인 계정으로 가입하세요.

## 페이지 구성

| 경로 | 기능 |
| --- | --- |
| `/login`, `/signup` | 로그인 / 회원가입 (scrypt 비밀번호 해시, httpOnly 세션 쿠키) |
| `/board` | 게시판 목록 · 검색 · 페이지 이동 |
| `/board/new`, `/board/[id]`, `/board/[id]/edit` | 글쓰기 · 상세 · 댓글 · 수정/삭제 (작성자 또는 관리자) |
| `/mypage` | 내 정보, 이름 · 비밀번호 변경, 내가 쓴 글, 회원 탈퇴 |
| `/admin` | 통계, 회원 권한 지정/해제 · 강제 탈퇴, 게시글 삭제 (관리자 전용) |
| `/search` | 게시글 · 댓글 · 회원(관리자) 조건 검색, 날짜 범위, 정렬, JSON 조회 |
| `/external` | Open-Meteo 날씨, 환율, GitHub 저장소 검색 (외부 공개 API) |
| `/tools` | JSON 정리, Base64/URL 인코딩, 해시, UUID, 타임스탬프 도구 + 서버 상태 · DB 백업 (관리자) |

### API

- `GET /api/health` — 서버 상태 확인
- `GET /api/search?q=&type=posts|comments|users&sort=latest|oldest&from=&to=` — 검색 결과 JSON
- `GET /api/admin/backup` — DB 백업 다운로드 (관리자)

## 구조

```
src/
├─ app/            # 페이지와 API 라우트
├─ actions/        # 서버 액션 (auth, board, account, admin) — 모든 액션에서 권한을 다시 확인
├─ components/     # Header, Footer, ActionForm, ConfirmButton, DevTools, 공통 UI
├─ data/site.ts    # 사이트 이름, 소개, 메뉴 구성
└─ lib/
   ├─ db.ts        # JSON 파일 저장소 (다른 DB로 바꿀 때 이 파일만 교체)
   ├─ auth.ts      # 세션 생성/삭제, 현재 사용자 조회
   ├─ queries.ts   # 목록 · 상세 · 통계 · 검색 조회
   ├─ external.ts  # 외부 API 호출 (몇 분간 캐시)
   └─ system.ts    # 서버 상태 정보
```

> `.data/db.json`은 개발·개인용 저장 방식입니다. 서버리스 환경(Vercel 등)에서는 파일이 유지되지 않으므로,
> 배포할 때는 `src/lib/db.ts`를 SQLite, PostgreSQL 같은 실제 데이터베이스로 바꾸세요.
