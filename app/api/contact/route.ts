import { NextRequest, NextResponse } from "next/server";
import { sendContactFormNotification } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Ім'я обов'язкове" },
        { status: 400 }
      );
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Email обов'язковий" },
        { status: 400 }
      );
    }
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Повідомлення обов'язкове" },
        { status: 400 }
      );
    }

    const sent = await sendContactFormNotification({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    if (!sent) {
      return NextResponse.json(
        { error: "Не вдалося надіслати повідомлення. Спробуйте пізніше." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/contact]", error);
    return NextResponse.json(
      { error: "Помилка сервера" },
      { status: 500 }
    );
  }
}
