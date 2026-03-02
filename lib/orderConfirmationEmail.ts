/**
 * HTML лист підтвердження замовлення (подяка, деталі, товари з фото, соцмережі).
 * Відправка через Resend після оплати замовлення.
 */

import { sendEmail } from "@/lib/email";

const PAYMENT_LABELS: Record<string, string> = {
  full: "Повна оплата",
  prepay: "Накладений платіж (мінімальна передоплата 200 грн)",
  pay_after: "Оплата при отриманні",
  test_payment: "Тест оплата",
  installment: "Розстрочка",
  crypto: "Криптовалюта",
};

const DELIVERY_LABELS: Record<string, string> = {
  nova_poshta_branch: "Нова пошта (відділення)",
  nova_poshta_courier: "Нова пошта (кур'єр)",
  nova_poshta_locker: "Нова пошта (поштомат)",
  showroom_pickup: "Самовивіз з шоуруму",
  ukrposhta: "Укрпошта",
};

export type OrderItemForEmail = {
  product_id: number | null;
  product_name: string | null;
  size: string;
  quantity: number;
  price: number;
  color?: string | null;
};

export type OrderForEmail = {
  customer_name: string;
  email: string | null;
  phone_number: string;
  delivery_method: string;
  city: string;
  post_office: string;
  payment_type: string;
  comment?: string | null;
  invoice_id: string;
  created_at: Date;
  items: OrderItemForEmail[];
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Побудова HTML листа в стилі сайту (кольори #3D1A00, #8B9A47, Montserrat).
 */
export function buildOrderConfirmationHtml(
  order: OrderForEmail,
  baseUrl: string,
  productImageUrls: Map<number, string>
): string {
  const logoUrl = baseUrl + "/images/logos/choice-logo-dark.png";
  const total = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  const paymentLabel = PAYMENT_LABELS[order.payment_type] || order.payment_type;
  const deliveryLabel = DELIVERY_LABELS[order.delivery_method] || order.delivery_method;
  const dateStr = new Date(order.created_at).toLocaleString("uk-UA");

  const rows = order.items
    .map((item, i) => {
      const imgUrl =
        item.product_id != null
          ? productImageUrls.get(item.product_id) || ""
          : "";
      const name = item.product_name || "Товар";
      const colorText = item.color ? `, ${escapeHtml(item.color)}` : "";
      const itemTotal = Number(item.price) * item.quantity;
      const imgCell = imgUrl
        ? `<img src="${escapeHtml(imgUrl)}" alt="" width="80" height="80" style="object-fit:cover;border-radius:8px;display:block;" />`
        : "<span style=\"color:#999;font-size:12px;\">—</span>";
      return `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #eee;vertical-align:middle;">${imgCell}</td>
          <td style="padding:12px 16px;border-bottom:1px solid #eee;vertical-align:middle;font-family:'Montserrat',sans-serif;font-size:14px;color:#3D1A00;">${escapeHtml(name)} (${escapeHtml(item.size)}${colorText})</td>
          <td style="padding:12px 16px;border-bottom:1px solid #eee;vertical-align:middle;font-family:'Montserrat',sans-serif;font-size:14px;color:#3D1A00;">${item.quantity}</td>
          <td style="padding:12px 16px;border-bottom:1px solid #eee;vertical-align:middle;font-family:'Montserrat',sans-serif;font-size:14px;color:#3D1A00;">${Number(item.price).toFixed(2)} ₴</td>
          <td style="padding:12px 16px;border-bottom:1px solid #eee;vertical-align:middle;font-family:'Montserrat',sans-serif;font-size:14px;color:#3D1A00;font-weight:600;">${itemTotal.toFixed(2)} ₴</td>
        </tr>`;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Дякуємо за замовлення</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Montserrat',sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(61,26,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#3D1A00;padding:28px 32px;text-align:center;">
              <a href="${escapeHtml(baseUrl)}" target="_blank" rel="noopener">
                <img src="${escapeHtml(logoUrl)}" alt="Choice" width="140" height="40" style="display:inline-block;max-height:40px;width:auto;" />
              </a>
            </td>
          </tr>
          <!-- Thank you -->
          <tr>
            <td style="padding:40px 32px 24px;">
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#3D1A00;letter-spacing:-0.02em;line-height:1.3;">
                Дякуємо за замовлення!
              </h1>
              <p style="margin:0;font-size:15px;color:#3D1A00;opacity:0.85;line-height:1.5;">
                Вітаємо, ${escapeHtml(order.customer_name)}! Ваше замовлення <strong>#${escapeHtml(order.invoice_id)}</strong> прийнято та оплачено.
              </p>
            </td>
          </tr>
          <!-- Order info -->
          <tr>
            <td style="padding:0 32px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f9f8f6;border-radius:12px;padding:20px;">
                <tr>
                  <td>
                    <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:#3D1A00;opacity:0.7;">Доставка</p>
                    <p style="margin:0 0 12px;font-size:15px;color:#3D1A00;">${escapeHtml(deliveryLabel)} · ${escapeHtml(order.city)}, ${escapeHtml(order.post_office)}</p>
                    <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:#3D1A00;opacity:0.7;">Оплата</p>
                    <p style="margin:0 0 4px;font-size:15px;color:#3D1A00;">${escapeHtml(paymentLabel)}</p>
                    <p style="margin:0;font-size:13px;color:#3D1A00;opacity:0.7;">Дата: ${escapeHtml(dateStr)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Products table -->
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0 0 12px;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#3D1A00;">Товари у замовленні</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eee;border-radius:12px;overflow:hidden;">
                <thead>
                  <tr style="background:#3D1A00;">
                    <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#fff;">Фото</th>
                    <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#fff;">Товар</th>
                    <th style="padding:12px 16px;text-align:center;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#fff;">К-сть</th>
                    <th style="padding:12px 16px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#fff;">Ціна</th>
                    <th style="padding:12px 16px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#fff;">Сума</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
              <p style="margin:16px 0 0;font-size:16px;font-weight:700;color:#3D1A00;text-align:right;">Разом: ${total.toFixed(2)} ₴</p>
            </td>
          </tr>
          ${order.comment && order.comment.trim() ? `
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#3D1A00;opacity:0.7;">Коментар</p>
              <p style="margin:0;font-size:14px;color:#3D1A00;">${escapeHtml(order.comment.trim())}</p>
            </td>
          </tr>
          ` : ""}
          <!-- Social & footer -->
          <tr>
            <td style="padding:32px;background:#f9f8f6;border-top:1px solid #eee;">
              <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#3D1A00;">Ми в соцмережах</p>
              <p style="margin:0 0 20px;">
                <a href="https://www.instagram.com/my_choice_mari" target="_blank" rel="noopener" style="display:inline-block;margin-right:12px;color:#8B9A47;font-size:14px;font-weight:500;text-decoration:none;">Instagram</a>
                <a href="https://t.me/my_choice_mari" target="_blank" rel="noopener" style="display:inline-block;color:#8B9A47;font-size:14px;font-weight:500;text-decoration:none;">Telegram</a>
              </p>
              <p style="margin:0;font-size:12px;color:#3D1A00;opacity:0.6;">
                Choice — eco та wellness рішення для здоров'я і дому.<br />
                <a href="${escapeHtml(baseUrl)}" style="color:#8B9A47;text-decoration:none;">${escapeHtml(baseUrl.replace(/^https?:\/\//, ""))}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Відправити лист підтвердження замовлення на email клієнта (якщо вказано).
 */
export async function sendOrderConfirmationEmail(
  order: OrderForEmail,
  productImageUrls: Map<number, string>
): Promise<{ success: boolean; error?: string }> {
  if (!order.email || !order.email.trim()) {
    return { success: true };
  }
  const baseUrl =
    process.env.PUBLIC_URL ||
    process.env.NEXT_PUBLIC_PUBLIC_URL ||
    "https://choice-site.com";
  const html = buildOrderConfirmationHtml(order, baseUrl, productImageUrls);
  return sendEmail({
    to: order.email.trim(),
    subject: `Дякуємо за замовлення #${order.invoice_id} — Choice`,
    html,
    text: `Дякуємо за замовлення! Номер: ${order.invoice_id}. Разом: ${order.items.reduce((s, i) => s + Number(i.price) * i.quantity, 0).toFixed(2)} ₴.`,
  });
}
