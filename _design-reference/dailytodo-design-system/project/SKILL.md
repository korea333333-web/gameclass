---
name: dailytodo-design
description: Use this skill to generate well-branded interfaces and assets for DailyTodo (투두 · 오늘의 할일), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

Quick orientation:
- `README.md` — content fundamentals, visual foundations, iconography rules.
- `colors_and_type.css` — drop-in CSS variables (`--surface-1`, `--ink-1`, `--status-miss`, etc.) and semantic type classes (`.dt-task`, `.dt-clock`, `.dt-caps`).
- `assets/icons/` — Phosphor `regular` SVG icons recolored to `currentColor`.
- `ui_kits/app/` — the canonical iOS UI kit (LockScreen / WidgetView / AppView). Copy these JSX components into your output.
- `preview/` — small, focused design-system cards. Read these to understand each token in isolation.

Hard rules — non-negotiable:
1. **Status is text, actions are icons.** `O X △ →` are typographic marks — never replace them with check/x/triangle icons.
2. **No emoji in product UI.** Use Phosphor regular icons or typographic marks.
3. **One icon family.** Phosphor `regular` only — never mix with Lucide, Heroicons, or Material.
4. **No blue, no saturated green, no gradients, no textures.** Warm paper minimalism.
5. **Korean type uses Pretendard** (loaded via CDN in `colors_and_type.css`). Latin uses SF Pro / Inter fallback.
6. **Voice is `-습니다` polite formal**, no exclamations, no coaching, no first/second person.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
