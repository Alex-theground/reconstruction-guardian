import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface ContactInquiryInput {
  orgName: string;
  contactName: string;
  position?: string;
  phone: string;
  email: string;
  stage?: string;
  households?: string;
  message?: string;
}

function createPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

async function sendTelegramNotification(inquiry: ContactInquiryInput) {
  const LOVABLE_API_KEY = process.env["LOVABLE_API_KEY"];
  const TELEGRAM_API_KEY = process.env["TELEGRAM_API_KEY"];
  const TELEGRAM_CHAT_ID = process.env["TELEGRAM_CHAT_ID"];
  if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY || !TELEGRAM_CHAT_ID) {
    console.error("Telegram env vars not configured");
    return;
  }

  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const text = [
    "<b>🔔 새 상담 신청이 접수되었습니다</b>",
    "",
    `<b>조합/사업장:</b> ${esc(inquiry.orgName)}`,
    `<b>담당자:</b> ${esc(inquiry.contactName)}${inquiry.position ? ` (${esc(inquiry.position)})` : ""}`,
    `<b>연락처:</b> ${esc(inquiry.phone)}`,
    `<b>이메일:</b> ${esc(inquiry.email)}`,
    inquiry.stage ? `<b>사업 단계:</b> ${esc(inquiry.stage)}` : null,
    inquiry.households ? `<b>세대 규모:</b> ${esc(inquiry.households)}` : null,
    inquiry.message ? `\n<b>상담 내용:</b>\n${esc(inquiry.message)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch(
    "https://connector-gateway.lovable.dev/telegram/sendMessage",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TELEGRAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Telegram notification failed [${response.status}]: ${errorBody}`);
  }
}

export const submitContactInquiry = createServerFn({ method: "POST" })
  .inputValidator((input: ContactInquiryInput) => {
    if (!input?.orgName?.trim() || !input?.contactName?.trim()) {
      throw new Error("조합명과 담당자 성함은 필수입니다.");
    }
    if (!input?.phone?.trim() || !input?.email?.trim()) {
      throw new Error("연락처와 이메일은 필수입니다.");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const supabasePublic = createPublicClient();

    const { error } = await supabasePublic.from("contact_inquiries").insert({
      org_name: data.orgName.trim(),
      contact_name: data.contactName.trim(),
      position: data.position?.trim() || null,
      phone: data.phone.trim(),
      email: data.email.trim(),
      stage: data.stage || null,
      households: data.households || null,
      message: data.message?.trim() || null,
    });

    if (error) {
      throw new Error("상담 신청 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }

    await sendTelegramNotification(data);

    return { ok: true };
  });

export const listContactInquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { data, error } = await context.supabase
      .from("contact_inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    return data;
  });
