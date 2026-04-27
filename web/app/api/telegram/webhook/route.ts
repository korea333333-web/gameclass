// 텔레그램 봇 webhook — 어드민이 [승인]/[거절] 인라인 버튼을 탭하면 호출됨.
//
// 보안:
//   1) 헤더 X-Telegram-Bot-Api-Secret-Token 검증 (TELEGRAM_WEBHOOK_SECRET 와 일치)
//   2) callback_query.from.id 가 TELEGRAM_ADMIN_CHAT_ID 와 일치 (어드민만)
//
// 등록:
//   사용자가 setWebhook URL을 한 번 호출해서 webhook 주소를 텔레그램에 알려줘야 함.
//   상세 안내는 작업 완료 후 별도 메시지에서.

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  answerCallback,
  editApprovalMessage,
  isAdminTelegramUser,
} from "@/lib/telegram";

type TelegramCallback = {
  id: string;
  from?: { id?: number };
  message?: {
    chat?: { id?: number };
    message_id?: number;
    text?: string;
  };
  data?: string;
};

type TelegramUpdate = {
  callback_query?: TelegramCallback;
};

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret) {
    const got = request.headers.get("x-telegram-bot-api-secret-token");
    if (got !== expectedSecret) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const cb = update.callback_query;
  if (!cb || !cb.data || !cb.from?.id || !cb.message) {
    return NextResponse.json({ ok: true });
  }

  if (!isAdminTelegramUser(cb.from.id)) {
    await answerCallback(cb.id, "권한이 없습니다");
    return NextResponse.json({ ok: true });
  }

  const [action, userId] = cb.data.split(":");
  if (!userId || (action !== "approve" && action !== "reject")) {
    await answerCallback(cb.id, "알 수 없는 동작");
    return NextResponse.json({ ok: true });
  }

  const admin = createAdminClient();
  const chatId = cb.message.chat?.id;
  const messageId = cb.message.message_id;
  const originalText = cb.message.text ?? "";

  if (action === "approve") {
    const { error } = await admin
      .from("profiles")
      .update({ is_active: true })
      .eq("id", userId);

    if (error) {
      console.error("[telegram/webhook] approve error", error);
      await answerCallback(cb.id, "승인 실패");
      return NextResponse.json({ ok: true });
    }

    if (chatId && messageId) {
      await editApprovalMessage(
        chatId,
        messageId,
        `${originalText}\n\n✅ 승인됨`,
      );
    }
    await answerCallback(cb.id, "승인되었습니다");
  } else if (action === "reject") {
    const { error: deleteProfileError } = await admin
      .from("profiles")
      .delete()
      .eq("id", userId);
    if (deleteProfileError) {
      console.error(
        "[telegram/webhook] delete profile error",
        deleteProfileError,
      );
    }
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(
      userId,
    );
    if (deleteUserError) {
      console.error(
        "[telegram/webhook] delete user error",
        deleteUserError,
      );
    }

    if (chatId && messageId) {
      await editApprovalMessage(
        chatId,
        messageId,
        `${originalText}\n\n❌ 거절됨 (재신청 가능)`,
      );
    }
    await answerCallback(cb.id, "거절되었습니다");
  }

  return NextResponse.json({ ok: true });
}
