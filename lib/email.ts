/**
 * Відправка email через Resend (https://resend.com).
 *
 * .env:
 * - RESEND_API_KEY=re_xxx — обов'язково.
 * - EMAIL_FROM — адреса відправника:
 *   • Тест: onboarding@resend.dev (працює без верифікації).
 *   • Прод: верифікуйте свій домен на resend.com/domains, потім напр. news@13vplus.com.
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.error("[email] RESEND_API_KEY is not set");
    return { success: false, error: "Email не налаштовано: відсутній RESEND_API_KEY" };
  }

  const to = Array.isArray(options.to) ? options.to : [options.to];
  const toValid = to.filter((e) => typeof e === "string" && e.includes("@"));

  if (toValid.length === 0) {
    return { success: false, error: "Немає валідних email-адрес" };
  }

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toValid,
      subject: options.subject,
      text: options.text ?? "",
      html: options.html ?? undefined,
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Невідома помилка";
    console.error("[email] Send failed:", err);
    return { success: false, error: message };
  }
}

/**
 * Відправка одного листа одному отримувачу (для циклу розсилки).
 */
export async function sendSingleEmail(to: string, subject: string, text?: string, html?: string) {
  return sendEmail({ to, subject, text, html });
}
