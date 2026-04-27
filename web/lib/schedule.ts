// 시간표 관련 공용 헬퍼.
// 시간은 "그날 자정부터의 분(minute)" 정수로 저장 (예: 09:00 = 540, 22:00 = 1320).

export const DAY_LABELS = ["월", "화", "수", "목", "금"] as const;
export const DAY_LABELS_FULL = ["월요일", "화요일", "수요일", "목요일", "금요일"] as const;

// day_of_week: 1=월 ~ 5=금
export const FIRST_DAY = 1;
export const LAST_DAY = 5;

// 그리드 시간 범위
export const GRID_START_MINUTE = 9 * 60; // 09:00
export const GRID_END_MINUTE = 22 * 60; // 22:00

// 30분 단위
export const SLOT_MINUTES = 30;

export type ColorKey =
  | "brick"
  | "mustard"
  | "olive"
  | "slate"
  | "mauve"
  | "terracotta"
  | "ink";

export const COLOR_KEYS: ColorKey[] = [
  "brick",
  "mustard",
  "olive",
  "slate",
  "mauve",
  "terracotta",
  "ink",
];

// Warm Paper 톤에 맞춘 절제된 색상 팔레트
// 카드 배경: 옅은 톤 / 테두리: 진한 톤 / 글자: 매우 진한 톤
export const COLORS: Record<
  ColorKey,
  { bg: string; border: string; text: string; label: string }
> = {
  brick: { bg: "#F2D9D2", border: "#B5483A", text: "#5A2419", label: "벽돌" },
  mustard: { bg: "#EFE4C7", border: "#B89B5E", text: "#5C4D2E", label: "겨자" },
  olive: { bg: "#E0E2D2", border: "#6E7A4E", text: "#363D27", label: "올리브" },
  slate: { bg: "#D8DCDF", border: "#5C6F7C", text: "#2E373E", label: "슬레이트" },
  mauve: { bg: "#E5D8DD", border: "#8C6E7A", text: "#46373D", label: "모브" },
  terracotta: {
    bg: "#EDD9CB",
    border: "#A66E5C",
    text: "#53372E",
    label: "테라코타",
  },
  ink: { bg: "#E2DBD0", border: "#6E635B", text: "#3D3530", label: "잉크" },
};

export function minutesToHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function hhmmToMinutes(hhmm: string): number | null {
  const m = hhmm.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
  return h * 60 + mm;
}

// 시작 시간 옵션 (09:00, 09:30, ..., 21:30)
export function timeOptions(): { value: string; minute: number }[] {
  const opts: { value: string; minute: number }[] = [];
  for (let m = GRID_START_MINUTE; m <= GRID_END_MINUTE - SLOT_MINUTES; m += SLOT_MINUTES) {
    opts.push({ value: minutesToHHMM(m), minute: m });
  }
  return opts;
}

export function endTimeOptions(): { value: string; minute: number }[] {
  const opts: { value: string; minute: number }[] = [];
  for (let m = GRID_START_MINUTE + SLOT_MINUTES; m <= GRID_END_MINUTE; m += SLOT_MINUTES) {
    opts.push({ value: minutesToHHMM(m), minute: m });
  }
  return opts;
}

export type ScheduleEntry = {
  id: string;
  name: string;
  day_of_week: number;
  start_minute: number;
  end_minute: number;
  location: string | null;
  professor: string | null;
  color: ColorKey;
};

// 두 시간 구간이 겹치는지
export function isOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

// 같은 요일의 다른 entry와 시간 겹침이 있는지
export function findConflict(
  entries: ScheduleEntry[],
  day: number,
  start: number,
  end: number,
  ignoreId?: string,
): ScheduleEntry | null {
  for (const e of entries) {
    if (ignoreId && e.id === ignoreId) continue;
    if (e.day_of_week !== day) continue;
    if (isOverlap(start, end, e.start_minute, e.end_minute)) {
      return e;
    }
  }
  return null;
}

// "지금"을 기준으로 다음 수업 찾기.
// 평일이면 오늘 남은 수업 → 같은 주 다음 평일들 → 다음 주 월요일 순서
export type NextClassInfo =
  | { kind: "soon"; entry: ScheduleEntry; minutesUntil: number }
  | { kind: "in_progress"; entry: ScheduleEntry; minutesUntilEnd: number }
  | { kind: "today_done" }
  | { kind: "weekend"; nextMondayEntry?: ScheduleEntry }
  | { kind: "empty" };

export function findNextClass(
  entries: ScheduleEntry[],
  now: Date = new Date(),
): NextClassInfo {
  if (entries.length === 0) return { kind: "empty" };

  const day = now.getDay(); // 0=일, 1=월, ..., 6=토
  const nowMinute = now.getHours() * 60 + now.getMinutes();

  // 오늘이 평일이면, 오늘 진행 중/이후 수업 먼저 확인
  if (day >= 1 && day <= 5) {
    const todayEntries = entries
      .filter((e) => e.day_of_week === day)
      .sort((a, b) => a.start_minute - b.start_minute);

    // 진행 중인 수업
    for (const e of todayEntries) {
      if (nowMinute >= e.start_minute && nowMinute < e.end_minute) {
        return {
          kind: "in_progress",
          entry: e,
          minutesUntilEnd: e.end_minute - nowMinute,
        };
      }
    }

    // 오늘 다음 수업
    for (const e of todayEntries) {
      if (e.start_minute > nowMinute) {
        return {
          kind: "soon",
          entry: e,
          minutesUntil: e.start_minute - nowMinute,
        };
      }
    }
  }

  // 같은 주 다음 평일 수업
  for (let offset = 1; offset <= 7; offset++) {
    const targetDayOfWeek = ((day + offset - 1) % 7) + 1; // 1=월
    if (targetDayOfWeek < 1 || targetDayOfWeek > 5) continue;

    const targetEntries = entries
      .filter((e) => e.day_of_week === targetDayOfWeek)
      .sort((a, b) => a.start_minute - b.start_minute);

    if (targetEntries.length > 0) {
      const first = targetEntries[0];
      const minutesPerDay = 24 * 60;
      const minutesUntil =
        offset * minutesPerDay - nowMinute + first.start_minute;
      return { kind: "soon", entry: first, minutesUntil };
    }
  }

  // 시간표는 있지만 평일 수업이 하나도 없음 (이상한 케이스)
  if (day === 0 || day === 6) {
    return { kind: "weekend" };
  }
  return { kind: "today_done" };
}

export function formatMinutesUntil(minutes: number): string {
  if (minutes < 1) return "곧 시작합니다";
  if (minutes < 60) return `${minutes}분 남았습니다`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h < 24) {
    return m === 0
      ? `${h}시간 남았습니다`
      : `${h}시간 ${m}분 남았습니다`;
  }
  const d = Math.floor(h / 24);
  const remH = h % 24;
  return remH === 0 ? `${d}일 남았습니다` : `${d}일 ${remH}시간 남았습니다`;
}
