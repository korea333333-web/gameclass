"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type CopyStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; count: number }
  | { kind: "error"; message: string };

export function ShareSection({
  initialShareCode,
  hasEntries,
  onCopied,
}: {
  initialShareCode: string | null;
  hasEntries: boolean;
  onCopied: () => void;
}) {
  const [shareCode, setShareCode] = useState<string | null>(initialShareCode);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [showInput, setShowInput] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [copyStatus, setCopyStatus] = useState<CopyStatus>({ kind: "idle" });

  async function onGenerate() {
    if (!hasEntries) {
      alert("시간표를 먼저 입력한 후 공유 코드를 만들어 주세요");
      return;
    }
    setGenerating(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("generate_share_code");
    setGenerating(false);
    if (error) {
      alert("코드 생성 실패: " + error.message);
      return;
    }
    if (typeof data === "string") {
      setShareCode(data);
    }
  }

  async function onCopyCode() {
    if (!shareCode) return;
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("복사에 실패했습니다. 코드를 직접 선택해 주세요");
    }
  }

  async function onSubmitCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = inputCode.trim().toUpperCase();
    if (code.length !== 6) {
      setCopyStatus({ kind: "error", message: "6자리 코드를 입력해 주세요" });
      return;
    }

    if (hasEntries) {
      const ok = confirm(
        "기존 시간표가 모두 삭제되고 친구의 시간표로 덮어써집니다. 계속하시겠어요?",
      );
      if (!ok) return;
    }

    setCopyStatus({ kind: "loading" });
    const supabase = createClient();
    const { data, error } = await supabase.rpc("copy_schedule_from_code", {
      p_code: code,
    });

    if (error) {
      const msg = error.message || "";
      const friendly = msg.includes("invalid_code")
        ? "코드를 찾을 수 없습니다"
        : msg.includes("own_code")
          ? "본인 코드로는 복사할 수 없습니다"
          : `복사 실패: ${msg}`;
      setCopyStatus({ kind: "error", message: friendly });
      return;
    }
    setCopyStatus({ kind: "ok", count: typeof data === "number" ? data : 0 });
    setInputCode("");
    setShowInput(false);
    onCopied();
  }

  return (
    <section className="mt-12">
      <hr className="dt-hairline mb-8" />

      <div className="dt-card mb-4">
        <p className="dt-caps mb-3">친구와 시간표 공유</p>

        {shareCode ? (
          <>
            <p className="dt-secondary mb-3">
              아래 코드를 단톡방에 알려주면, 친구들이 같은 시간표를 한 번에 받을
              수 있어요
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <div
                className="dt-mono"
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  letterSpacing: 4,
                  color: "var(--color-ink-1)",
                }}
              >
                {shareCode}
              </div>
              <button
                type="button"
                onClick={onCopyCode}
                className="dt-btn-card"
              >
                {copied ? "복사됨" : "복사"}
              </button>
            </div>
            <p className="dt-meta">한 번 만든 코드는 계속 같은 코드입니다</p>
          </>
        ) : (
          <>
            <p className="dt-secondary mb-3">
              시간표를 입력했다면 공유 코드를 만들어 친구들에게 알려줄 수 있어요
            </p>
            <button
              type="button"
              onClick={onGenerate}
              disabled={generating || !hasEntries}
              className="dt-btn-card"
            >
              {generating ? "만드는 중..." : "공유 코드 만들기"}
            </button>
            {!hasEntries && (
              <p className="dt-meta mt-2">
                먼저 시간표에 과목을 하나 이상 등록해 주세요
              </p>
            )}
          </>
        )}
      </div>

      <div className="dt-card">
        <p className="dt-caps mb-3">친구 코드로 시간표 받기</p>

        {!showInput ? (
          <>
            <p className="dt-secondary mb-3">
              반장이나 친구가 알려준 6자리 코드로 시간표를 한 번에 받아올 수
              있어요
            </p>
            <button
              type="button"
              onClick={() => setShowInput(true)}
              className="dt-btn-card"
            >
              친구 코드 입력
            </button>
          </>
        ) : (
          <form onSubmit={onSubmitCode} className="space-y-3">
            <input
              type="text"
              value={inputCode}
              onChange={(e) =>
                setInputCode(e.target.value.toUpperCase().slice(0, 6))
              }
              placeholder="K3M9P2"
              className="dt-input dt-mono"
              style={{
                fontSize: 22,
                letterSpacing: 4,
                textAlign: "center",
              }}
              maxLength={6}
              autoFocus
            />
            {copyStatus.kind === "error" && (
              <p
                className="dt-secondary"
                style={{ color: "var(--color-status-miss)" }}
                role="alert"
              >
                {copyStatus.message}
              </p>
            )}
            {copyStatus.kind === "ok" && (
              <p className="dt-secondary" role="status">
                {copyStatus.count}개 과목을 받았습니다
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowInput(false);
                  setInputCode("");
                  setCopyStatus({ kind: "idle" });
                }}
                className="dt-btn-card flex-1"
                style={{ background: "var(--color-surface-3)" }}
                disabled={copyStatus.kind === "loading"}
              >
                취소
              </button>
              <button
                type="submit"
                className="dt-btn-card flex-1"
                disabled={copyStatus.kind === "loading"}
              >
                {copyStatus.kind === "loading" ? "받는 중..." : "받기"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
