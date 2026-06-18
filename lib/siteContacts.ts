/** Публічні контакти бренду на сайті */
export const SITE_TELEGRAM_URL = "https://t.me/brand13vplusukraine";

export const SITE_PHONE_DISPLAY = "+380 (93) 309 95 03";
export const SITE_PHONE_TEL = "tel:+380933099503";
export const SITE_PHONE_DIGITS = "380933099503";
export const SITE_EMAIL = "13vplus@gmail.com";

export const SITE_VIBER_URL = `viber://chat?number=${SITE_PHONE_DIGITS}`;
export const SITE_WHATSAPP_URL = `https://wa.me/${SITE_PHONE_DIGITS}`;

export const SITE_SUPPORT_MESSENGERS = [
  { name: "Telegram", link: SITE_TELEGRAM_URL },
  { name: "Viber", link: SITE_VIBER_URL },
  { name: "WhatsApp", link: SITE_WHATSAPP_URL },
] as const;

const STORE_ADDRESS_QUERY =
  "вулиця Данила Щербаківського, 45A, Київ, Україна";

export const SITE_STORE_LOCATION = {
  title: "КИЇВ",
  address: "м. Київ, вулиця Данила Щербаківського, 45A",
  streetAddress: "вулиця Данила Щербаківського, 45A",
  city: "Київ",
  country: "UA",
  workingHours: "з понеділка по неділю з 09:00 до 19:00",
  supportHours: "з понеділка по неділю — з 10:30 до 23:30",
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE_ADDRESS_QUERY)}`,
  mapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(STORE_ADDRESS_QUERY)}`,
  mapsEmbedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(STORE_ADDRESS_QUERY)}&hl=uk&z=16&output=embed`,
  /** Приблизні координати для schema.org */
  latitude: 50.4142,
  longitude: 30.6348,
} as const;
