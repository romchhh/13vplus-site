/**
 * Telegram Bot API utilities for sending order notifications
 */

interface OrderData {
  id: number;
  invoice_id: string;
  customer_name: string;
  phone_number: string;
  email?: string | null;
  delivery_method: string;
  city: string;
  post_office: string;
  comment?: string | null;
  payment_type: string;
  payment_status: string;
  status?: string | null;
  items: Array<{
    product_name: string;
    size: string;
    quantity: number;
    price: number;
    color?: string | null;
  }>;
  created_at: Date;
}

/**
 * Format order data into a readable Telegram message
 */
function formatOrderMessage(order: OrderData, isPaid: boolean = false): string {
  const paymentTypeMap: Record<string, string> = {
    full: "Повна оплата",
    prepay: "Передоплата 200 грн",
    pay_after: "Оплата після (при отриманні)",
    test_payment: "Тест оплата (імітація)",
    installment: "Розстрочка",
    crypto: "Криптовалюта",
  };

  const paymentStatusEmoji = isPaid ? "✅" : "⏳";
  const paymentStatusText = isPaid ? "ОПЛАЧЕНО" : "ОЧІКУЄ ОПЛАТИ";

  // Calculate total
  const total = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  // Get base URL for order link
  const baseUrl = process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "https://choice-site.com";
  const orderLink = `${baseUrl}/admin/orders/${order.id}/edit`;
  
  let message = `${paymentStatusEmoji} <b>НОВЕ ЗАМОВЛЕННЯ ${paymentStatusText}</b>\n\n`;
  message += `📋 <b>ID:</b> <a href="${orderLink}">${order.invoice_id}</a>\n`;
  message += `👤 <b>Клієнт:</b> ${order.customer_name}\n`;
  message += `📞 <b>Телефон:</b> ${order.phone_number}\n`;

  if (order.email) {
    message += `📧 <b>Email:</b> ${order.email}\n`;
  }

  message += `\n💳 <b>Спосіб оплати:</b> ${paymentTypeMap[order.payment_type] || order.payment_type}\n`;
  message += `📦 <b>Доставка:</b> ${order.delivery_method}\n`;
  message += `🏙️ <b>Місто:</b> ${order.city}\n`;
  message += `📍 <b>Відділення:</b> ${order.post_office}\n`;

  if (order.comment) {
    message += `\n💬 <b>Коментар:</b>\n${order.comment}\n`;
  }

  message += `\n🛍️ <b>Товари:</b>\n`;
  order.items.forEach((item, index) => {
    const itemTotal = Number(item.price) * item.quantity;
    const colorText = item.color ? `, ${item.color}` : "";
    message += `${index + 1}. ${item.product_name} (${item.size}${colorText})\n`;
    message += `   Кількість: ${item.quantity} × ${Number(item.price).toFixed(2)} ₴ = ${itemTotal.toFixed(2)} ₴\n`;
  });

  message += `\n💰 <b>Загальна сума:</b> ${total.toFixed(2)} ₴\n`;
  message += `\n🕐 <b>Дата:</b> ${new Date(order.created_at).toLocaleString("uk-UA")}\n`;

  return message;
}

/**
 * Send order notification to Telegram
 */
export async function sendOrderNotification(
  order: OrderData,
  isPaid: boolean = false
): Promise<boolean> {
  try {
    const botToken = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    if (!botToken || !chatId) {
      console.warn(
        "[Telegram] Missing BOT_TOKEN or CHAT_ID, skipping notification"
      );
      return false;
    }

    const message = formatOrderMessage(order, isPaid);

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Telegram] Failed to send message:", errorData);
      return false;
    }

    console.log(`[Telegram] Notification sent for order ${order.invoice_id}`);
    return true;
  } catch (error) {
    console.error("[Telegram] Error sending notification:", error);
    return false;
  }
}

/**
 * Send contact form message to Telegram group (same BOT_TOKEN + CHAT_ID)
 */
export async function sendContactFormNotification(data: {
  name: string;
  email: string;
  message: string;
}): Promise<boolean> {
  try {
    const botToken = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    if (!botToken || !chatId) {
      console.warn(
        "[Telegram] Missing BOT_TOKEN or CHAT_ID, skipping contact form notification"
      );
      return false;
    }

    const text =
      `📩 <b>НОВЕ ПОВІДОМЛЕННЯ З ФОРМИ ЗВ'ЯЗКУ</b>\n\n` +
      `👤 <b>Ім'я:</b> ${escapeHtml(data.name)}\n` +
      `📧 <b>Email:</b> ${escapeHtml(data.email)}\n\n` +
      `💬 <b>Повідомлення:</b>\n${escapeHtml(data.message)}\n\n` +
      `🕐 <b>Дата:</b> ${new Date().toLocaleString("uk-UA")}`;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Telegram] Failed to send contact form message:", errorData);
      return false;
    }
    console.log("[Telegram] Contact form notification sent");
    return true;
  } catch (error) {
    console.error("[Telegram] Error sending contact form notification:", error);
    return false;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

