# DailyTodo (투두 · 오늘의 할일) Design System

## What is DailyTodo?

**DailyTodo (투두 · 오늘의 할일)** is a minimalist Korean to-do / daily task app, built around a single visual idea: **your day, on your lock screen.** Tasks live as iOS-style notification cards, calendar widgets, and a notification-center style task list — so you see what matters without unlocking, opening, scrolling.

The product feels like a piece of stationery — warm off-white paper, light brown ink, no chrome, no decoration. Tasks are tagged in parentheses by category — `(독서)`, `(영어)`, `(미적1)` — and statuses are written, not iconified: `O` 완료, `X` 못 함, `△` 일부, `→` 연기.

Target users are Korean students and study-focused adults (수험생 · 직장인 · 자기계발) who want a calm, paper-like task surface — not a gamified, gradient-heavy productivity app.

## Sources provided

This design system was built from **three product screenshots** (KakaoTalk export, 2026-04-27). No codebase, Figma file, or written brand guide was supplied. The screenshots show:

1. **Lock screen with DAILYTODO notification cards** — task notifications styled like native iOS lock-screen alerts.
2. **Notification-center widget view** — full task list inside a `DAILYTODO TODOLIST WIDGET` card, with `앱 열기` / `할 일 추가` buttons and an `편집` link below.
3. **In-app calendar + task list view** — month strip, daily quote/excerpt card, task rows with status marks, bottom tab bar with `🗓️` (calendar) and `⚙️` (settings) icons, plus a `+` floating add button.

Source files are kept at `uploads/KakaoTalk_20260427_011516504*.png` for reference.

## Index

```
README.md                     ← this file (start here)
SKILL.md                      ← Claude Code-compatible skill manifest
colors_and_type.css           ← CSS variables: colors + type tokens

assets/
  icons/                      ← Phosphor regular SVG icons (currentColor)

preview/                      ← Design System tab cards
  color_surfaces.html         · warm-paper surface ramp
  color_ink.html              · ink ramp
  color_status.html           · O / X / △ / →
  type_display.html           · 80px clock numerals
  type_scale.html             · h1 / h2 / task / body / caps / meta
  type_quote.html             · bilingual quote card
  spacing_radii_shadows.html  · 4px grid, radii, flat shadows
  icons_library.html          · 16 working icons
  icons_sizing.html           · xs → xl, ink-1/2/3/warn
  status_anatomy.html         · task row + prefix + status mark
  component_notification.html · iOS-style DAILYTODO notification
  component_buttons.html      · card btn / text / FAB / icon
  component_tabbar.html       · tab bar + search field
  component_calendar_strip.html · week strip with selected day
  brand_wordmark.html         · DAILYTODO + 투두 marks

ui_kits/
  app/                        ← iOS UI kit
    index.html                · all three surfaces side-by-side (interactive)
    LockScreen.jsx            · lock screen + DAILYTODO notifications
    WidgetView.jsx            · notification-center widget
    AppView.jsx               · in-app calendar + task list
    README.md                 · UI kit notes

uploads/                      ← original source screenshots (3 KakaoTalk PNGs)
```

---

## CONTENT FUNDAMENTALS

DailyTodo's voice is **quiet, plain, and respectful** — the way a paper planner is. It doesn't market, exclaim, or coach.

### Voice & tone

- **Language:** Korean primary. English short labels (e.g. `DAILYTODO`, `DAILYTODO TODOLIST WIDGET`) appear as system-style ALL-CAPS chips.
- **Honorifics:** `-습니다` polite formal in system messages (`2019년 05월 11일 토요일에 시작합니다`). Not `-요` casual, not banmal. Reads as a calm announcement.
- **Pronouns:** Neither "I" nor "you" — the product is not a coach. Tasks are written by the user as plain noun phrases (`도서관에서 책 빌리기`, `독후감 제출하기`, `엄마 생일 선물 주문하기`).
- **No emoji.** Status is text-only: `O / X / △ / →`. The only iconography is utility (camera, calendar, settings, add).
- **No exclamation marks.** No rallying copy. No "Let's get started!" — just the task.
- **Dates are spelled out** with units: `2019년 05월 11일 토요일`, `2019년 06월`. Numerals are zero-padded (`05월`, not `5월`).

### Casing

- ALL-CAPS English for system labels: `DAILYTODO`, `DAILYTODO TODOLIST WIDGET`.
- Sentence case Korean for buttons: `앱 열기`, `할 일 추가`, `편집`, `간략히 보기`.
- No title case. No camelCase visible to the user.

### Categories

Tasks are user-tagged with a parenthesized prefix in front of the task title. Real examples from the screenshots:

- `(독서) 도서관에서 책 빌리기`
- `(독서) 독후감 제출하기`
- `(미적1) 기출의 미래: 함수의 극한 오답 정리`
- `(기벡) 기출의 미래: 평면에서 풀기`
- `(국어) 2019년 6월 모의고사 풀고 오답 정리`
- `(영어) 영어단어 DAY 16 암기`
- `(한국사) 06강 고려의 경제 사회와 문화 강의 듣기`
- `(선물) 엄마 생일 선물 주문하기`

The category in `()` is **muted** — same family but lower-contrast — and the task body is full-contrast. This is a signature pattern.

### Status marks

Right-aligned, single character, color-coded:

| Mark | Meaning      | Color treatment                       |
| ---- | ------------ | ------------------------------------- |
| `O`  | 완료 (done)  | warm muted (no green!)                |
| `X`  | 못 함 (miss) | warm red / brick                      |
| `△`  | 일부 (part)  | warm muted                            |
| `→`  | 연기 (defer) | warm muted                            |

The marks are **typographic, not icons** — they're just characters set in the same font as the text.

### Quotes & excerpts

The calendar view shows a daily quote card — bilingual KO/EN, set in a slightly smaller serif-ish weight, indented and italicized in feel. Example:

> 지혜는 학교에서 배우는 것이 아니라 평생 노력해 얻는 것이다
> Wisdom is not a product of schooling, but of the life-long attempt to acquire it

This is the only place "extra" copy appears. It's paper-quiet, not motivational.

---

## VISUAL FOUNDATIONS

The aesthetic is **warm paper minimalism**. If the iOS Notes app and a beige Moleskine had a baby, and that baby refused to use color.

### Color

A single dominant **warm off-white** background (`#F2EEE8`-ish), with cards a half-step lighter (`#FAF7F2`), and ink in **warm dark brown** (`#3D3530`). Accents are limited to a **brick red** for `X` / destructive and the same brown at lower alpha for muted text.

- **No blue.** No pure black. No saturated greens.
- Imagery is rare. When it appears, it is monochrome / desaturated, never full-color photography.
- Status colors are warm — even `X` is a brick/terracotta, not a tech-red.

### Typography

- **Korean:** Pretendard (free, OTF/woff2 via CDN) as the closest match to Apple SD Gothic Neo, the iOS system Korean font visible in the screenshots.
- **Latin/numerals:** SF Pro fallback, then Inter — for big clock numerals (`1:38`, `1:24`, `9:05`) and ALL-CAPS chips.
- **Weights used:** 300 (clock numerals, light), 400 (body), 500 (task titles, button labels), 600 (rare — section headers).
- **Sizes are generous and airy** — task rows are ~16px with 16-20px vertical padding, never crammed.
- **Tracking is loose** on ALL-CAPS chips (`DAILYTODO TODOLIST WIDGET` has clear letter-spacing).

### Spacing

A 4px base grid. Common steps: 4 / 8 / 12 / 16 / 20 / 24 / 32. Cards use 16-20 horizontal padding, 14-16 vertical between rows.

### Backgrounds

- Solid warm off-white. **No gradients. No textures. No illustrations.**
- The iOS device-bezel screenshots show the phone "floating" on the same warm off-white — the product canvas continues edge-to-edge.

### Cards

- Background: a half-step lighter than the surface (`#FAF7F2` on `#F2EEE8`).
- Radius: ~14px (iOS notification-card radius).
- Shadow: **none** or extremely subtle (`0 1px 2px rgba(60,40,30,0.04)`). The card reads as a tonal shift, not a lifted plane.
- Border: none.
- Internal padding: 14px 16px.

### Borders & dividers

- Hairline dividers between rows: 1px, very low-alpha brown (`rgba(60,53,48,0.06-0.08)`).
- No outlined cards. No outlined buttons except the two inline action buttons (`앱 열기`, `할 일 추가`) which have a thin warm-gray stroke and the same card background.

### Shadows

- Almost everything is flat. Only the floating `+` button uses a soft shadow (`0 4px 14px rgba(60,40,30,0.08)`).

### Corner radii

| Element                              | Radius |
| ------------------------------------ | ------ |
| Notification cards / list cards      | 14px   |
| Buttons                              | 8-10px |
| Search field                         | 10px   |
| Pill / day-of-week dot indicator     | full   |
| Floating action button (`+`)         | full   |

### Buttons

- **Primary (filled):** card-color background (`#FAF7F2`), thin warm-gray border, 500-weight label, 10px radius. Used for `앱 열기`, `할 일 추가`. *They look like cards, not buttons.*
- **Tertiary (text):** plain text, no chrome. `편집`, `간략히 보기`.
- **Floating:** circular, `#FAF7F2` fill, soft shadow, `+` glyph in dark brown.
- **No primary-color CTAs.** There is no "blue button."

### Hover / press

- Hover: subtle brightness shift (cards go to `#FCFAF6`).
- Press: card darkens 2-3% and offsets nothing — no scale, no shadow change.
- Selected day in the calendar strip: filled circle in dark brown, white numeral.

### Animation

- **Quiet.** 200-260ms ease-out. Crossfades preferred over slides.
- Status flips (O ↔ X ↔ △) animate as a fast char swap with a 120ms opacity dip.
- The list reorder uses iOS-native springy reorder when held.
- No bouncy entrances. No confetti. No checkbox sparkles.

### Transparency & blur

- The lock-screen and notification-center surfaces use the iOS system blur — `backdrop-filter: blur(20px) saturate(1.2)` — over the warm wallpaper.
- Inside the app, no blur. Surfaces are opaque.

### Layout rules

- Top status bar (iOS, system).
- Generous side gutters: 20-24px on a 375px iPhone width.
- Bottom safe-area is honored — the home indicator is preserved.
- Tab bar at the bottom of the in-app view: 2 icons (`🗓️ calendar`, `⚙️ settings`) with the `+` FAB centered above when present.
- The widget surface uses **left-aligned label, right-aligned status mark** — this is the most repeated pattern.

### Imagery

- Almost none. The screenshots use **no photography or illustration** anywhere.
- If imagery is needed, it should be desaturated, warm-toned, and treated as a near-monochrome insert.

---

## ICONOGRAPHY

> Color is restrained, so **iconography carries the design**. Every icon must feel hand-picked, consistent in weight, and quiet. Sloppy icons will break this system instantly.

### Family — Phosphor Icons, "Regular" weight only

We use **[Phosphor Icons](https://phosphoricons.com/), `regular` weight, exclusively**. Reasons:

1. **Stroke matches iOS SF Symbols** — ~1.5px stroke at 24px, rounded line caps and joins, no flourishes.
2. **Consistent 24×24 grid, 18×18 active area.** Optical centering matches Apple's grid.
3. **Free and open** (MIT license).
4. **Recolorable** — all SVGs are recolored to `currentColor` so they inherit `--ink-1` / `--ink-2`.

**Do not mix weights** (no `bold` + `regular` together). **Do not mix families** (no Lucide, no Heroicons, no Material). One look, everywhere.

> ⚠️ **Substitution flag:** Phosphor `regular` is the closest free match to iOS SF Symbols. If running inside a real iOS app, prefer SF Symbols and discard Phosphor. Document the swap in your output.

### Icons shipped in `assets/icons/`

| Token                | Used for                                              |
| -------------------- | ----------------------------------------------------- |
| `list`               | The `≡` glyph in front of `DAILYTODO` notification labels |
| `calendar-blank`     | Bottom tab — calendar view                            |
| `gear`               | Bottom tab — settings                                 |
| `plus`               | FAB — "add task" (`할 일 추가`)                       |
| `pencil-simple`      | `편집` link                                            |
| `magnifying-glass`   | Widget search field (`검색`)                           |
| `camera`             | Lock-screen camera shortcut (pill button)              |
| `bell`               | Notification settings                                  |
| `lock-simple`        | Lock screen / private items                            |
| `flashlight`         | Lock-screen flashlight shortcut                        |
| `caret-right` / `caret-left` / `caret-down` / `caret-up` | Disclosure chevrons in lists |
| `arrow-right`        | Carry-over indicator (alternative to typographic `→`)  |
| `check`, `x`, `trash`, `dots-three` | Standard actions                        |
| `book-open`, `translate`, `sparkle`, `gift`, `graduation-cap` | Optional category markers — never required, only when the user requests visual category cues |

### Sizing

Icons are sized by **role**, not pixel value, to stay consistent across the system:

| Role           | Box     | Stroke (visual) | Where                         |
| -------------- | ------- | --------------- | ----------------------------- |
| `--icon-xs`    | 14×14   | thin            | inline meta (timestamps, tags) |
| `--icon-sm`    | 16×16   | regular         | secondary actions, list rows   |
| `--icon-md`    | 20×20   | regular         | primary inline icons           |
| `--icon-lg`    | 24×24   | regular         | tab bar, FAB, header buttons   |
| `--icon-xl`    | 28×28   | regular         | empty states                   |

**Never scale an icon below 14px or above 32px** in product UI. Below 14px the stroke breaks down; above 32px Phosphor `regular` looks too thin — switch to Phosphor `light` if you really need a 40px+ icon (and document it).

### Color rules

- **Single color, always.** No two-tone, no fills, no gradient.
- Default to `--ink-1` for **primary** icons (tab-bar selected, FAB).
- Default to `--ink-2` for **secondary / inactive** icons (tab-bar unselected, list row trailing icons).
- Status icons that shouldn't read as warning use `--ink-3` (muted).
- The only colored icon allowed is `trash` in destructive confirms — `--accent-warn`.

### Hit targets

All icon buttons have a **minimum 44×44 hit target** (iOS HIG), regardless of glyph size. Pad with transparent space; don't grow the glyph.

### Typographic marks vs icons

This is the most important rule in the system:

> **Status is text. Actions are icons.**

| Concept       | What it is | Why                             |
| ------------- | ---------- | ------------------------------- |
| `O / X / △ / →` task status | Typographic — body font | Hand-written feel, no celebration, no "tech-green checkmark" |
| Tab bar, FAB, search, edit, camera | Pictographic — Phosphor regular | These are commands, not state |

**Do not** swap status marks for icons (no `check-circle`, no `x-circle`).
**Do not** spell out actions as letters (no `A` for add — use `plus`).

### Emoji policy

**No emoji anywhere in product UI.** Not for status, not for categories, not for empty states, not for marketing surfaces inside the product. The only emoji in this repo are inside `README.md` for documentation purposes.

### Logo

No formal logomark was provided. The wordmark `DAILYTODO` is the brand mark — set in 500-weight Pretendard, ALL-CAPS, 0.08em tracking, `--ink-1`. When prefixed by the `list` icon (`≡ DAILYTODO`), it becomes the iOS notification-source chip.

> ⚠️ **Asset gap:** No app-icon source, no splash screen, no marketing imagery. **Please provide a real logo, an app icon (1024×1024), and a splash if available.**

### Unicode marks

- `O` (uppercase letter O, **not** the digit 0 and **not** ○)
- `X` (uppercase letter X, **not** ✕)
- `△` (U+25B3 white up-pointing triangle)
- `→` (U+2192 rightwards arrow)

These are set in the body font, in their semantic color, sized to match the surrounding text.

### Logo

No formal logo was provided in the source materials. The wordmark `DAILYTODO` is treated as the brand mark — set in 500-weight Pretendard, ALL-CAPS, with ~80-100/1000em letter-spacing, and a leading `≡` (three-line menu glyph) when shown as a notification card prefix. The Korean wordmark `투두 — 오늘의 할일` is used in narrative / marketing contexts.

> ⚠️ **Asset gap:** No app-icon source, no splash, no marketing imagery. This kit ships a wordmark only. **Please provide a real logo if one exists.**
