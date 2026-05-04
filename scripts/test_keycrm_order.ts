/**
 * Тестове створення замовлення в KeyCRM для того ж покупця, що в чекауті
 * (Роман Федонюк, +380960908006, roman.fedoniuk@gmail.com).
 *
 * Потрібно в .env: KEYCRM_API_KEY, KEYCRM_SOURCE_ID
 *
 * Запуск: npm run test-keycrm-order
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createKeycrmOrder } from "../lib/keycrm-order";

function loadEnvFromFile(): void {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

async function main() {
  loadEnvFromFile();

  if (!process.env.KEYCRM_API_KEY?.trim() || !process.env.KEYCRM_SOURCE_ID?.trim()) {
    console.error("Встановіть KEYCRM_API_KEY та KEYCRM_SOURCE_ID у .env");
    process.exit(1);
  }

  const sourceUuid = `test-keycrm-${crypto.randomUUID()}`;

  const { buyerId, orderId } = await createKeycrmOrder({
    buyer: {
      full_name: "Роман Федонюк",
      phone: "+380960908006",
      email: "roman.fedoniuk@gmail.com",
    },
    products: [
      {
        name: "Тестове замовлення (npm run test-keycrm-order)",
        price: 1,
        quantity: 1,
      },
    ],
    shipping: {
      shipping_address_city: "Київ",
      shipping_address_country: "UA",
      recipient_full_name: "Роман Федонюк",
      recipient_phone: "+380960908006",
      shipping_receive_point: "Відділення №342: вул. Ентузіастів, 47 (тест скрипта)",
    },
    payments: [
      {
        amount: 1,
        status: "not_paid",
        payment_method: "Тест (скрипт)",
      },
    ],
    source_uuid: sourceUuid,
    buyer_comment: "Автотест createKeycrmOrder / scripts/test_keycrm_order.ts",
  });

  console.log("OK — KeyCRM");
  console.log("  buyer_id:  ", buyerId);
  console.log("  order_id:  ", orderId);
  console.log("  source_uuid:", sourceUuid);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
