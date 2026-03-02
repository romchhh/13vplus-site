import { prisma } from "@/lib/prisma";

/**
 * Нормалізує телефон для порівняння (тільки цифри).
 */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export type OrderCustomerInput = {
  customer_name: string;
  email?: string | null;
  phone: string;
  city: string;
  post_office: string;
};

/**
 * Знаходить користувача за email або телефоном, або створює нового.
 * Повертає id користувача для прив'язки до замовлення.
 */
export async function getOrCreateOrderCustomer(input: OrderCustomerInput): Promise<string | null> {
  const { customer_name, email, phone, city, post_office } = input;
  const address = [city, post_office].filter(Boolean).join(", ");
  const phoneNorm = normalizePhone(phone);

  // Шукаємо спочатку по email (унікальне поле), потім по телефону
  if (email && email.trim()) {
    const byEmail = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true },
    });
    if (byEmail) {
      await prisma.user.update({
        where: { id: byEmail.id },
        data: {
          name: customer_name.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address || undefined,
        },
      });
      return byEmail.id;
    }
  }

  // По телефону (можливо кілька записів — беремо перший)
  if (phoneNorm.length >= 10) {
    const users = await prisma.user.findMany({
      where: {
        phone: { not: null },
      },
      select: { id: true, phone: true },
      take: 100,
    });
    const byPhone = users.find((u) => u.phone && normalizePhone(u.phone) === phoneNorm);
    if (byPhone) {
      await prisma.user.update({
        where: { id: byPhone.id },
        data: {
          name: customer_name.trim() || undefined,
          email: email?.trim() || undefined,
          address: address || undefined,
        },
      });
      return byPhone.id;
    }
  }

  // Створюємо нового користувача (клієнта без акаунту)
  const created = await prisma.user.create({
    data: {
      name: customer_name.trim() || "Клієнт",
      email: email?.trim() || null,
      phone: phone.trim() || null,
      address: address || null,
    },
    select: { id: true },
  });
  return created.id;
}
