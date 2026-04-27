// 텔레그램 봇 API 호출 헬퍼.
// 환경변수가 비어있으면 모든 호출은 조용히 무시됨 (개발 환경에서 안 깨지도록).
//
// 필요한 환경변수:
//   - TELEGRAM_BOT_TOKEN (BotFather 발급)
//   - TELEGRAM_ADMIN_CHAT_ID (어드민 본인 chat_id)
//   - TELEGRAM_WEBHOOK_SECRET (webhook 호출 검증용 임의 문자열)

const TG_API = "https://api.telegram.org";

function botToken() {
  return process.env.TELEGRAM_BOT_TOKEN || "";
}

function adminChatId() {
  return process.env.TELEGRAM_ADMIN_CHAT_ID || "";
}

export function isTelegramConfigured() {
  return Boolean(botToken() && adminChatId());
}

export function isAdminTelegramUser(fromId: number | string | undefined) {
  if (!fromId) return false;
  return String(fromId) === adminChatId();
}

async function tgFetch(path: string, body: unknown) {
  const token = botToken();
  if (!token) return null;
  try {
    const res = await fetch(`${TG_API}/bot${token}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(
        `[telegram] ${path} failed`,
        res.status,
        await res.text().catch(() => ""),
      );
      return null;
    }
    return res.json();
  } catch (e) {
    console.error(`[telegram] ${path} error`, e);
    return null;
  }
}

type ApprovalArgs = {
  userId: string;
  studentId: string;
  name: string;
  grade: number;
};

export async function sendApprovalRequest({
  userId,
  studentId,
  name,
  grade,
}: ApprovalArgs) {
  if (!isTelegramConfigured()) {
    console.warn("[telegram] not configured, skipping approval notify");
    return;
  }
  const text = [
    "🆕 가입 신청",
    `학번: ${studentId}`,
    `이름: ${name}`,
    `학년: ${grade}학년`,
    "",
    "본인 맞으면 승인, 모르는 사람이면 거절을 눌러 주세요.",
  ].join("\n");

  await tgFetch("sendMessage", {
    chat_id: adminChatId(),
    text,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ 승인", callback_data: `approve:${userId}` },
          { text: "❌ 거절", callback_data: `reject:${userId}` },
        ],
      ],
    },
  });
}

export async function editApprovalMessage(
  chatId: number | string,
  messageId: number,
  newText: string,
) {
  await tgFetch("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text: newText,
  });
}

export async function answerCallback(callbackQueryId: string, text?: string) {
  await tgFetch("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text: text ?? "",
  });
}
