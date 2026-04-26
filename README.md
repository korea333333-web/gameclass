# GameClass

> 광운대 정보과학교육원(정고원) 게임학과 학생을 위한 학사 관리 + 팀프로젝트 협업 PWA

## 핵심 차별점

- **시각화 대시보드 10종** — 도넛 / 번다운 / 번업 / 간트 / 레이더 / 막대 / 히트맵 / 마일스톤 스킬트리 / 속도 / 게이지
- **게임 개발 팀 워크플로우** — 역할별 분담, 컨셉 → 프로토타입 → 알파 → 베타 → 골드 마일스톤
- **조용한 게임화** — XP / 레벨 / 출석률 / 업적

## 문서

| 파일 | 용도 |
|---|---|
| [PLAN.md](./PLAN.md) | 전체 기획 (비전, 기능, UI, 기술스택, 디자인) |
| [SPRINT_PLAN.md](./SPRINT_PLAN.md) | 5개 스프린트 / 6주 계획 |
| [TEST_CRITERIA.md](./TEST_CRITERIA.md) | 스프린트별 완료 기준 |
| [CLAUDE.md](./CLAUDE.md) | Claude Code 작업 가이드 |

## 프로젝트 구조

```
gameclass/
├── PLAN.md / SPRINT_PLAN.md / TEST_CRITERIA.md / CLAUDE.md
├── _design-reference/   # DailyTodo 디자인 시스템 (Claude Design handoff)
└── web/                 # Next.js 16 + Supabase PWA
    ├── app/
    ├── components/
    ├── lib/
    ├── public/
    └── ...
```

## 디자인 시스템

**Warm Paper Minimalism** — 따뜻한 종이 미니멀.

- 컬러: 오프화이트 `#F2EEE8` / 갈색 잉크 `#3D3530` / 벽돌색 강조 `#B5483A`
- 폰트: Pretendard Variable
- 아이콘: Phosphor Regular
- 상태 표시: `O X △ →` (텍스트, 이모지/아이콘 ❌)

원본: `_design-reference/dailytodo-design-system/project/colors_and_type.css`

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프론트엔드 | Next.js 16 (App Router) + React 19 + TypeScript |
| 스타일 | TailwindCSS v4 |
| 백엔드 | Supabase (Auth + Postgres + Realtime + Storage) |
| 아이콘 | @phosphor-icons/react |
| 상태 | Zustand |
| 차트 (Sprint 4) | Recharts + D3.js |
| 칸반 (Sprint 3) | @dnd-kit |
| 배포 | Vercel |

## 시작하기

```bash
cd web
npm install
cp .env.local.example .env.local
# .env.local 에 Supabase URL/KEY 입력
npm run dev
```

## Vercel 배포

1. GitHub repo Vercel에 Import
2. **⭐ Root Directory: `web`** (모노레포 구조)
3. 환경변수 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy

## Supabase 셋업

1. https://supabase.com 가입 → 새 프로젝트 (Region: Seoul)
2. SQL Editor에서 [`web/lib/supabase/schema.sql`](./web/lib/supabase/schema.sql) 실행
3. Settings → API에서 URL / anon key 복사 → `.env.local` 또는 Vercel 환경변수
4. Authentication → URL Configuration에 배포 도메인 추가

## 라이선스

학내 사용 목적. 외부 배포 시 별도 합의 필요.
