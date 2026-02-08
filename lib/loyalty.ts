/**
 * Програма лояльності 13в+ — накопичувальна бонусна система.
 * 3% лише на першу покупку; далі знижки немає до 25k; від 25k — 5%, від 45k — 7%, 65k — 10%, 90k — 12%, 110k — 15%.
 * День народження: +500 грн бонусів.
 */

import type { PrismaClient } from "@prisma/client";

export const BIRTHDAY_BONUS_UAH = 500;

/** Пороги (грн) та відсоток бонусу від покупки */
export const LOYALTY_TIERS: { threshold: number; percent: number; name: string }[] = [
  { threshold: 0, percent: 3, name: "Новий клієнт" },
  { threshold: 25_000, percent: 5, name: "Лояльний клієнт" },
  { threshold: 45_000, percent: 7, name: "Особливий клієнт" },
  { threshold: 65_000, percent: 10, name: "Друг" },
  { threshold: 90_000, percent: 12, name: "Найкращий друг" },
  { threshold: 110_000, percent: 15, name: "BFF" },
];

/**
 * Відсоток бонусу залежно від загальної суми попередніх оплачених замовлень (грн).
 */
export function getBonusPercent(totalSpent: number): number {
  let percent = LOYALTY_TIERS[0].percent;
  for (let i = LOYALTY_TIERS.length - 1; i >= 0; i--) {
    if (totalSpent >= LOYALTY_TIERS[i].threshold) {
      percent = LOYALTY_TIERS[i].percent;
      break;
    }
  }
  return percent;
}

/** Поріг (грн), з якого для повторних покупок дається 5% (після першої покупки 3% більше не застосовується). */
const TIER_5_PERCENT_THRESHOLD = 25_000;

/**
 * Відсоток знижки для покупки: 3% лише на першу покупку; далі 5% тільки від 25k, інакше знижки немає.
 * @param totalSpent — сума попередніх оплачених замовлень (грн)
 * @param paidOrdersCount — кількість попередніх оплачених замовлень (0 = перша покупка)
 */
export function getBonusPercentForPurchase(totalSpent: number, paidOrdersCount: number): number {
  if (paidOrdersCount === 0) return 3; // лише перша покупка — 3%
  if (totalSpent < TIER_5_PERCENT_THRESHOLD) return 0; // не перша покупка і менше 25k — знижки немає
  return getBonusPercent(totalSpent); // 25k+ — 5%, далі 7–15% за порогами
}

export interface LoyaltyTierInfo {
  name: string;
  percent: number;
  nextTier: { threshold: number; percent: number; name: string } | null;
  progress: number;
}

/**
 * Поточний рівень лояльності та прогрес до наступного.
 */
export function getLoyaltyTier(totalSpent: number): LoyaltyTierInfo {
  let current = LOYALTY_TIERS[0]!;
  let next: (typeof LOYALTY_TIERS)[number] | null = LOYALTY_TIERS[1] ?? null;
  for (let i = 0; i < LOYALTY_TIERS.length; i++) {
    const tier = LOYALTY_TIERS[i]!;
    if (totalSpent >= tier.threshold) {
      current = tier;
      next = LOYALTY_TIERS[i + 1] ?? null;
    }
  }
  const nextTier = next && next.threshold > current.threshold
    ? { threshold: next.threshold, percent: next.percent, name: next.name }
    : null;
  const progress = nextTier
    ? Math.min(100, ((totalSpent - current.threshold) / (nextTier.threshold - current.threshold)) * 100)
    : 100;
  return {
    name: current.name,
    percent: current.percent,
    nextTier,
    progress,
  };
}

/**
 * Рівень лояльності для відображення: 3% лише перша покупка; далі до 25k — 0%, потім 5% і вище.
 */
export function getLoyaltyTierForDisplay(totalSpent: number, paidOrdersCount: number): LoyaltyTierInfo {
  if (paidOrdersCount === 0) return getLoyaltyTier(0); // Новий клієнт 3%
  if (totalSpent < TIER_5_PERCENT_THRESHOLD) {
    const next = LOYALTY_TIERS[1]; // Лояльний клієнт 5% від 25k
    return {
      name: "До лояльного клієнта",
      percent: 0,
      nextTier: next ? { threshold: next.threshold, percent: next.percent, name: next.name } : null,
      progress: next ? Math.min(100, (totalSpent / next.threshold) * 100) : 0,
    };
  }
  return getLoyaltyTier(totalSpent);
}

/** Елемент для лінії прогресу: поріг, відсоток, назва, чи досягнуто, чи поточний рівень */
export interface LoyaltyTierStep {
  threshold: number;
  percent: number;
  name: string;
  reached: boolean;
  isCurrent: boolean;
}

/**
 * Усі рівні лояльності з позначками reached/isCurrent для відображення лінії прогресу.
 */
export function getLoyaltyTiersForProgress(totalSpent: number): LoyaltyTierStep[] {
  let currentIndex = 0;
  for (let i = LOYALTY_TIERS.length - 1; i >= 0; i--) {
    if (totalSpent >= LOYALTY_TIERS[i]!.threshold) {
      currentIndex = i;
      break;
    }
  }
  return LOYALTY_TIERS.map((tier, i) => ({
    threshold: tier.threshold,
    percent: tier.percent,
    name: tier.name,
    reached: totalSpent >= tier.threshold,
    isCurrent: i === currentIndex,
  }));
}

/**
 * Скільки бонусів буде нараховано за суму покупки (грн).
 * Бонуси не нараховуються на частину, оплачену бонусами/промо — передавати суму, сплачену грошима.
 * @param paidOrdersCountBefore — кількість оплачених замовлень до цього (0 = це перша покупка).
 */
export function getBonusToEarn(
  amountPaidInCash: number,
  totalSpentBeforeOrder: number,
  paidOrdersCountBefore: number
): number {
  if (amountPaidInCash <= 0) return 0;
  const percent = getBonusPercentForPurchase(totalSpentBeforeOrder, paidOrdersCountBefore);
  return Math.floor((amountPaidInCash * percent) / 100);
}

/**
 * Перевіряє, чи дата замовлення потрапляє в вікно дня народження (2 дні до, день, 2 дні після).
 * Порівнює лише місяць і день (рік ігнорується).
 */
export function isBirthdayBonusEligible(orderDate: Date, birthDate: Date | null): boolean {
  if (!birthDate) return false;
  const o = new Date(orderDate);
  const b = new Date(birthDate);
  const orderNorm = new Date(o.getFullYear(), o.getMonth(), o.getDate()).getTime();
  const birthNorm = new Date(o.getFullYear(), b.getMonth(), b.getDate()).getTime();
  const twoDays = 2 * 24 * 60 * 60 * 1000;
  return Math.abs(orderNorm - birthNorm) <= twoDays;
}

/** Order shape for bonus crediting (server-side) */
export type OrderForBonusCredit = {
  id: number;
  userId: string | null;
  createdAt: Date;
  bonusPointsSpent: number;
  loyaltyDiscountAmount?: number | { toNumber?: () => number } | null;
  user: { birthDate: Date | null } | null;
  items: { price: { toNumber?: () => number } | number; quantity: number }[];
};

/**
 * Нараховує бонуси користувачу після оплати замовлення.
 * Викликати один раз при переході замовлення в payment_status = "paid".
 */
export async function creditBonusesForPaidOrder(
  prisma: PrismaClient,
  order: OrderForBonusCredit
): Promise<{ credited: number }> {
  if (!order.userId) return { credited: 0 };

  const orderTotal = order.items.reduce(
    (sum, item) => sum + (typeof item.price === "number" ? item.price : Number(item.price)) * item.quantity,
    0
  );
  const loyaltyDiscount =
    order.loyaltyDiscountAmount == null
      ? 0
      : typeof order.loyaltyDiscountAmount === "number"
        ? order.loyaltyDiscountAmount
        : Number(order.loyaltyDiscountAmount);
  const amountPaidInCash = Math.max(
    0,
    orderTotal - loyaltyDiscount - (order.bonusPointsSpent || 0)
  );

  const paidOrdersBefore = await prisma.order.findMany({
    where: {
      userId: order.userId,
      paymentStatus: "paid",
      createdAt: { lt: order.createdAt },
    },
    select: {
      id: true,
      items: { select: { price: true, quantity: true } },
    },
  });
  const totalSpentBefore = paidOrdersBefore.reduce((sum, o) => {
    const tot = o.items.reduce(
      (s: number, it: { price: unknown; quantity: number }) => s + Number(it.price) * it.quantity,
      0
    );
    return sum + tot;
  }, 0);

  const paidOrdersCountBefore = paidOrdersBefore.length;
  const toCredit = getBonusToEarn(amountPaidInCash, totalSpentBefore, paidOrdersCountBefore);
  const birthdayBonus =
    isBirthdayBonusEligible(order.createdAt, order.user?.birthDate ?? null) ? BIRTHDAY_BONUS_UAH : 0;
  const totalCredit = toCredit + birthdayBonus;

  if (totalCredit > 0) {
    await prisma.user.update({
      where: { id: order.userId },
      data: { bonusPoints: { increment: totalCredit } },
    });
  }
  return { credited: totalCredit };
}
