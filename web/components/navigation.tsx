"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  CalendarBlank,
  CheckSquare,
  UsersThree,
  Gear,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

type IconComponent = ComponentType<{
  size?: number | string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  color?: string;
  className?: string;
}>;

type NavItem = {
  href: string;
  label: string;
  icon: IconComponent;
};

const ITEMS: NavItem[] = [
  { href: "/", label: "홈", icon: House },
  { href: "/schedule", label: "시간표", icon: CalendarBlank },
  { href: "/tasks", label: "과제", icon: CheckSquare },
  { href: "/teams", label: "팀", icon: UsersThree },
  { href: "/profile", label: "프로필", icon: Gear },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* 모바일 — 하단 탭바 */}
      <nav
        aria-label="주 메뉴"
        className="fixed bottom-0 left-0 right-0 z-40 border-t md:hidden"
        style={{
          background: "var(--color-surface-3)",
          borderColor: "var(--hairline)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <ul className="grid grid-cols-5">
          {ITEMS.map(({ href, label, icon: I }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="flex flex-col items-center justify-center gap-1 py-3"
                  aria-current={active ? "page" : undefined}
                >
                  <I
                    size={22}
                    weight="regular"
                    color={active ? "var(--color-ink-1)" : "var(--color-ink-3)"}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-medium tracking-wide",
                    )}
                    style={{
                      color: active
                        ? "var(--color-ink-1)"
                        : "var(--color-ink-3)",
                    }}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 데스크톱 — 좌측 사이드바 */}
      <nav
        aria-label="주 메뉴"
        className="fixed top-0 bottom-0 left-0 z-40 hidden w-60 border-r md:flex md:flex-col"
        style={{
          background: "var(--color-surface-3)",
          borderColor: "var(--hairline)",
        }}
      >
        <div className="px-6 pb-6 pt-8">
          <Link href="/" className="dt-caps">
            GAMECLASS
          </Link>
        </div>
        <ul className="flex-1 space-y-1 px-3">
          {ITEMS.map(({ href, label, icon: I }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-[10px] px-3 py-2.5 transition-colors",
                  )}
                  style={{
                    background: active ? "var(--color-surface-4)" : "transparent",
                    color: active ? "var(--color-ink-1)" : "var(--color-ink-2)",
                  }}
                  aria-current={active ? "page" : undefined}
                >
                  <I
                    size={20}
                    weight="regular"
                    color={active ? "var(--color-ink-1)" : "var(--color-ink-2)"}
                  />
                  <span className="dt-task" style={{ color: "inherit" }}>
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="px-6 pb-8 pt-4">
          <p className="dt-meta">광운대 정고원 게임학과</p>
        </div>
      </nav>
    </>
  );
}
