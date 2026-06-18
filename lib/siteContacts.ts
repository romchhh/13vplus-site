/** Публічні контакти бренду на сайті */
export const SITE_TELEGRAM_URL = "https://t.me/brand13vplusukraine";

export const SITE_PHONE_DISPLAY = "+380 (93) 309 95 03";
export const SITE_PHONE_TEL = "tel:+380933099503";
export const SITE_PHONE_DIGITS = "380933099503";

export const SITE_VIBER_URL = `viber://chat?number=${SITE_PHONE_DIGITS}`;
export const SITE_WHATSAPP_URL = `https://wa.me/${SITE_PHONE_DIGITS}`;

export const SITE_SUPPORT_MESSENGERS = [
  { name: "Telegram", link: SITE_TELEGRAM_URL },
  { name: "Viber", link: SITE_VIBER_URL },
  { name: "WhatsApp", link: SITE_WHATSAPP_URL },
] as const;
