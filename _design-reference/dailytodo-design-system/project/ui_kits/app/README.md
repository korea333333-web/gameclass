# DailyTodo · iOS UI Kit

A pixel-faithful recreation of the three core DailyTodo surfaces, as seen in the source screenshots.

## Components

| File              | What it is                                                              |
| ----------------- | ----------------------------------------------------------------------- |
| `LockScreen.jsx`  | iOS lock screen with `1:38` clock, `5월 11일 토요일`, two DAILYTODO notification cards, flashlight + camera shortcut pills |
| `WidgetView.jsx`  | Notification-center surface with search field, `1:24` clock + date right-aligned, the `DAILYTODO TODOLIST WIDGET` card with eight task rows, `앱 열기` / `할 일 추가` buttons, and the bottom `편집` text link |
| `AppView.jsx`     | In-app calendar + task list — `2019년 06월` header, weekday strip with day `10` selected (filled circle), the bilingual quote card, the full task list (tap any row to cycle `O → X → △ → →`), the floating `+` FAB, and the bottom `🗓️ / ⚙️` tab bar |

## Open

Open `index.html` to see all three side-by-side. Notification rows and task rows are interactive (cycle status). The `+` FAB shows an alert.

## Notes

- The phone bezels are hand-drawn (not Apple SF Symbols) to match the warm-paper canvas — the device "floats" on the same surface, edge-to-edge, the way the source screenshots show.
- Icons are loaded from `../../assets/icons/` (Phosphor regular).
- Status marks (`O X △ →`) are typographic — never icons. See the iconography rules in the root `README.md`.
- All colors and type come from `../../colors_and_type.css`. Don't override locally.
