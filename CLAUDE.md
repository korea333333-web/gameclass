# GameClass — 프로젝트 컨텍스트

> **Claude Code가 새 세션에서 이 프로젝트를 이어 작업할 때 자동으로 읽는 가이드**

---

## 프로젝트 개요

**GameClass**는 광운대학교 정보과학교육원(정고원) 게임학과 학생을 위한
**학사 관리 + 팀프로젝트 협업 PWA**입니다.

핵심 차별점:
- **시각화 대시보드 10종** (도넛/번다운/번업/간트/레이더/막대/히트맵/스킬트리/속도/게이지)
- **게임 개발 팀 워크플로우** (역할별 분담, 컨셉→골드 마일스톤)
- **게임화 요소** (XP/레벨/업적)

대상: 광운대 정고원 게임학과 같은 학년 30-50명

---

## 개발 방식

이 프로젝트는 **3-Agent Harness** 방식으로 개발합니다.

### 핵심 문서

| 파일 | 용도 |
|---|---|
| `PLAN.md` | 전체 기획 (비전, 기능, UI, 기술스택, 디자인) |
| `SPRINT_PLAN.md` | 5개 스프린트 / 6주 계획 |
| `TEST_CRITERIA.md` | 스프린트별 완료 기준 |
| `CLAUDE.md` | 본 문서 (작업 가이드) |

### 절대 규칙

1. **한 번에 하나의 스프린트만 진행** — 다른 스프린트 기능 절대 추가 금지
2. **TEST_CRITERIA.md 통과 없이 다음 스프린트로 넘어가지 않음**
3. **코드 작성 후 빌드/타입/린트/테스트 실행 + 결과 보고**
4. **AI 슬롭 디자인 금지** — 보라 그라디언트, 흰 카드+파란 CTA 등
5. **에러 발생 시 로그를 직접 읽고 분석** — 추측 금지
6. **Supabase RLS 필수** — 모든 테이블에 Row Level Security 활성화

---

## 기술 스택

| 영역 | 기술 | 비고 |
|---|---|---|
| 프론트엔드 | Next.js 15 (App Router) | TypeScript 필수 |
| 스타일 | TailwindCSS + shadcn/ui | |
| 백엔드 | Supabase | Auth + Postgres + Realtime + Storage |
| 상태관리 | Zustand | |
| 차트 | **Recharts** + **D3.js** | Recharts 우선, 커스텀만 D3 |
| 간트 | gantt-task-react | |
| 히트맵 | react-calendar-heatmap | |
| 칸반 DnD | @dnd-kit | 모바일 터치 지원 |
| 푸시 | Web Push API + FCM | |
| 배포 | Vercel | |
| 데스크톱 (v2) | Tauri 2.0 | |
| 모바일 (v3) | Capacitor | |

---

## 디자인 원칙 (절대 규칙) — DailyTodo 디자인 시스템 채택

> 디자인 컨셉: **Warm Paper Minimalism** (따뜻한 종이 미니멀)
> 원본 토큰: `_design-reference/dailytodo-design-system/project/colors_and_type.css`
> 픽셀 퍼펙트 재현 필수.

### 컬러 시스템 (라이트 모드 기본)

#### Surface (따뜻한 종이 램프)
| 용도 | HEX |
|---|---|
| 디바이스 외부 | `#ECE6DD` |
| 페이지 배경 (paper) | `#F2EEE8` |
| 카드 (quote) | `#F7F3EC` |
| 카드 (list/notification) | `#FAF7F2` |
| 팝오버 / 시트 | `#FDFBF7` |

#### Ink (갈색 잉크 램프)
| 용도 | HEX |
|---|---|
| 본문 primary | `#3D3530` |
| 보조 / ALL-CAPS chip | `#6E635B` |
| 카테고리 prefix `(과목)` | `#A89E94` |
| placeholder | `#C9C0B5` |
| hairline | `#E2DBD0` |

#### Status (warm only)
| Mark | HEX | 의미 |
|---|---|---|
| `O` | `#6E635B` | 완료 (녹색 ❌) |
| `X` | `#B5483A` | 못함 (벽돌색) |
| `△` `→` | `#A89E94` | 부분/연기 |

### 타이포그래피

- **폰트**: Pretendard Variable (CDN: `cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css`)
- **Weight**: 300 (시계) / 400 (본문) / 500 (제목/버튼) / 600 (드물게)
- **Mono**: SF Mono / 시스템

### 아이콘

- **Phosphor Icons, Regular weight 전용** (`@phosphor-icons/react`)
- 크기 16~24px, 단일 색 (`--ink-1` 또는 `--ink-2`)
- 다른 아이콘 라이브러리 혼용 금지
- 24개 시스템 아이콘 SVG: `_design-reference/.../assets/icons/`

### 상태 마크 (Signature)

> 이게 핵심. **상태는 타이포그래피, 절대 아이콘 ❌**

```
O = 완료 (대문자 O, U+004F, 0 ❌, ○ ❌)
X = 못함 (대문자 X, U+0058, ✕ ❌)
△ = 부분 (U+25B3)
→ = 연기 (U+2192)
```

### Spacing & Radius

- 4px base: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64
- Radius: 6 / 10 (button) / 14 (card) / 20 / 9999 (pill, FAB)

### 애니메이션 (조용함)

- 200~260ms `cubic-bezier(0.22, 1, 0.36, 1)` ease-out
- 상태 플립: 120ms opacity dip + char swap
- 바운스/스파클/색종이/큰 플래시 ❌

### 게임화 톤 재해석

GameClass의 게임화는 이 시스템에서 **조용하게**:
- XP: `+50 XP` 작은 muted 숫자
- 레벨업: 조용한 페이드 인 알림 (`→ Lv.13으로 올라갔습니다`)
- 마일스톤 달성: 정중한 시스템 메시지
- 진행률 차트: 갈색/벽돌색 톤만 (네온 ❌)
- 우선순위: 텍스트 마커 (`!`, `!!`, `!!!`)

### Voice & Tone

- 한국어 primary, 영어 라벨은 ALL-CAPS chip
- 정중체 `-습니다` (`2026년 04월 27일에 시작합니다`)
- 느낌표 ❌, 코칭 톤 ❌
- 날짜 zero-pad (`05월` not `5월`)

### 절대 금지 (AI 슬롭 패턴) — 강화

- ❌ **다크 모드** (이 디자인은 라이트 베이스)
- ❌ 보라/파랑 그라데이션 (`from-purple- to-blue-`)
- ❌ 네온 컬러 (`#00F0FF`, `#ADFF2F`)
- ❌ 이모지 (UI 어디에도, 카테고리 prefix 포함)
- ❌ Lucide / Heroicons / Material (Phosphor Regular만)
- ❌ 흰색 카드 + 파란 CTA (SaaS 클론)
- ❌ `shadow-2xl`, `drop-shadow-xl` 남발
- ❌ 녹색 체크마크 (완료는 muted `O`)
- ❌ 점수 폭발/색종이/스파클

---

## 프로젝트 구조 (제안)

```
gameclass/
├── app/
│   ├── (auth)/login/
│   ├── (main)/
│   │   ├── page.tsx                  # 홈
│   │   ├── schedule/                 # 시간표
│   │   ├── tasks/                    # 과제
│   │   ├── teams/
│   │   │   └── [id]/
│   │   │       ├── kanban/           # 칸반 보드
│   │   │       ├── dashboard/        # 시각화 ⭐
│   │   │       └── gallery/          # 산출물
│   │   └── profile/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                # shadcn 컴포넌트
│   ├── charts/            # Recharts + D3 차트
│   ├── kanban/            # 칸반 컴포넌트
│   └── shared/
├── lib/
│   ├── supabase/          # Supabase 클라이언트
│   ├── auth/              # 인증 헬퍼
│   └── utils/
├── stores/                # Zustand 스토어
├── hooks/
├── public/
│   ├── manifest.json      # PWA
│   └── icons/
└── types/
    └── database.types.ts  # Supabase 자동 생성
```

---

## 주요 명령어

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 타입 체크
npx tsc --noEmit

# 린트
npm run lint

# 테스트
npm run test           # Vitest 단위 테스트
npm run test:e2e       # Playwright E2E

# Supabase
supabase db push
supabase gen types typescript --local > types/database.types.ts

# 배포
vercel --prod
```

## 환경변수 (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # ⚠ NEXT_PUBLIC_ 접두사 절대 금지
NEXT_PUBLIC_APP_URL=

# Sprint 5에서 추가
NEXT_PUBLIC_FCM_VAPID_KEY=
FCM_SERVER_KEY=
```

---

## 스프린트 진행 프롬프트 (복붙용)

### Generator (코드 작성)

```
PLAN.md의 Sprint [N]과 TEST_CRITERIA.md의 Sprint [N] 기준을 읽고 코드를 작성해.

규칙:
- Sprint [N]의 기능만 구현 (다른 스프린트 절대 금지)
- TEST_CRITERIA.md의 모든 체크박스를 통과하도록 할 것
- CLAUDE.md의 디자인 원칙 준수 (AI 슬롭 0개)
- 코드 작성 후 다음을 실행하고 결과 보고:
  1. npm run build (에러 0)
  2. npx tsc --noEmit (에러 0)
  3. npm run lint (경고 0)
  4. npm run test (가능 시)
- 디자인 검증: AI 슬롭 패턴 검색 (보라 그라디언트, 흰 카드+파란 버튼)
```

### Evaluator (테스트 & 평가)

```
Sprint [N] 코드와 TEST_CRITERIA.md를 비교해서:
1. 자동화 테스트 코드 작성 (Vitest/Playwright)
2. 테스트 직접 실행
3. 디자인 검증: AI 슬롭 패턴 검색
4. 모든 TC-N.X 체크박스가 통과하는지 확인
5. 통과 못한 항목 있으면 FAIL + 구체적 개선안
6. 통과할 때까지 수정 요청 반복
```

### 다음 스프린트 전환

```
Sprint [N]이 완료됐으니, Sprint [N+1]의 완료 기준을
TEST_CRITERIA.md에 추가하고 코드를 작성해.
```

---

## 구체 제약사항

### 인증 방식 (2026-04-27 변경)

> **변경 이유**: 학교 이메일 매직링크가 학생 입장에서 너무 번거로움.
> 어드민(사용자)이 명단을 미리 등록하는 화이트리스트 기반으로 전환.

- ✅ **학번 + 비밀번호** + **사전 등록 화이트리스트(roster)** 방식
- 어드민이 학번/이름 명단을 미리 등록 (`roster` 테이블)
- 학생: `/signup` → 학번+이름 입력 → 명단 매칭 확인 → 본인 비번 생성 → 자동 로그인
- 학생: `/login` → 학번+비번 → 로그인 (세션 30일 유지)
- 어드민: `/admin/login` 별도 통로 → 이메일+비번
- Supabase Auth는 내부적으로 가짜 도메인 `{학번}@gameclass.local`로 학번을 이메일처럼 활용 (학생 UI 노출 ❌)
- 명단에 없는 학번은 가입 자체가 거부됨 → 외부인 차단

### 구현하지 말아야 할 것

- ❌ 광운대 LMS 자동 크롤링 (학교 차단/보안 리스크)
- ❌ roster 화이트리스트 우회 가능한 가입 흐름 (외부인 가입 차단 필수)
- ❌ 위치 기반 자동 출석 체크 (부정 가능성)
- ❌ 학번/이름 명단을 코드 레포지토리(GitHub)에 커밋 (개인정보 → DB에만 저장)

### 알아두어야 할 한계

- iOS PWA 푸시 알림: **iOS 16.4 이상에서만** 동작 → 미지원 사용자에게 안내 메시지
- Supabase 무료 티어: DB 500MB, Realtime 200동시연결 → **50명까지 충분**
- Vercel Hobby: 월 100GB 트래픽 → **50명까지 충분**

---

## 외부 리소스

- 광운대 정고원: https://eduwill.kw.ac.kr
- 학교 이메일 도메인: `@kw.ac.kr`
- 디자인 레퍼런스: Riot Client, Steam Deck UI, Persona 5 메뉴
- Supabase 문서: https://supabase.com/docs
- Next.js 15 문서: https://nextjs.org/docs

---

## 첫 작업 시작 방법

1. `npm create next-app@latest gameclass -- --typescript --tailwind --app` 으로 프로젝트 생성
2. shadcn/ui 초기화: `npx shadcn@latest init`
3. Supabase 프로젝트 생성 (https://supabase.com)
4. 환경변수 설정 (`.env.local`)
5. **Generator 프롬프트로 Sprint 1 시작**

---

**📅 문서 작성일**: 2026-04-27
**📌 현재 단계**: Sprint 1 시작 대기
