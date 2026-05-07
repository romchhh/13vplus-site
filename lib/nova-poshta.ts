/**
 * Серверні виклики API Нової Пошти (v2.0 JSON).
 * Ключ: NOVA_POSHTA_API_KEY (той самий тип ключа, що й для довідників).
 * Для створення ЕН потрібні реквізити відправника з особистого кабінету НП (refs).
 */

const NP_JSON = "https://api.novaposhta.ua/v2.0/json/";

export type NpApiResponse<T> = {
  success: boolean;
  data?: T;
  errors?: string[];
  warnings?: string[];
  info?: unknown[];
};

function getApiKey(): string | undefined {
  return (
    process.env.NOVA_POSHTA_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_NOVA_POSHTA_API_KEY?.trim()
  );
}

/** Телефон для НП: лише цифри, бажано 380… */
export function normalizeNpPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("0") && d.length === 10) return `38${d}`;
  if (d.startsWith("80") && d.length === 11) return `3${d}`;
  if (d.startsWith("380")) return d;
  return d;
}

async function npRequest<T>(
  modelName: string,
  calledMethod: string,
  methodProperties: Record<string, unknown>
): Promise<NpApiResponse<T>> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { success: false, errors: ["NOVA_POSHTA_API_KEY is not set"] };
  }

  const res = await fetch(NP_JSON, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey,
      modelName,
      calledMethod,
      methodProperties,
    }),
  });

  if (!res.ok) {
    return {
      success: false,
      errors: [`HTTP ${res.status}: ${res.statusText}`],
    };
  }

  return (await res.json()) as NpApiResponse<T>;
}

type NpCityRow = { Ref: string; Description: string };
type NpWarehouseRow = { Ref: string; Description: string; CityRef?: string };

async function resolveCityRefByName(cityName: string): Promise<string | null> {
  const name = cityName.trim();
  if (!name) return null;
  const resp = await npRequest<NpCityRow[]>("AddressGeneral", "getCities", {
    FindByString: name,
    Limit: 20,
  });
  if (!resp.success || !resp.data?.length) return null;
  const exact =
    resp.data.find((c) => c.Description?.toLowerCase() === name.toLowerCase()) ??
    resp.data[0];
  return exact?.Ref ?? null;
}

async function resolveWarehouseRefByText(
  cityRef: string,
  warehouseText: string
): Promise<string | null> {
  const q = warehouseText.trim();
  if (!q) return null;
  const resp = await npRequest<NpWarehouseRow[]>("AddressGeneral", "getWarehouses", {
    CityRef: cityRef,
    FindByString: q,
    Limit: 20,
  });
  if (!resp.success || !resp.data?.length) return null;
  const exact =
    resp.data.find((w) => w.Description?.toLowerCase() === q.toLowerCase()) ??
    resp.data[0];
  return exact?.Ref ?? null;
}

function splitFullName(fullName: string): {
  firstName: string;
  lastName: string;
  middleName: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "—", lastName: "—", middleName: "" };
  if (parts.length === 1) return { firstName: parts[0]!, lastName: parts[0]!, middleName: "" };
  if (parts.length === 2) return { firstName: parts[0]!, lastName: parts[1]!, middleName: "" };
  return {
    firstName: parts[0]!,
    lastName: parts[parts.length - 1]!,
    middleName: parts.slice(1, -1).join(" "),
  };
}

type NpCounterpartySaveRow = {
  Ref?: string;
};

type NpContactPersonsRow = { Ref?: string };

async function ensureRecipientCounterparty(params: {
  fullName: string;
  phoneDigits: string;
  cityRef: string;
}): Promise<{ recipientRef: string; contactRef: string } | { error: string }> {
  const { firstName, lastName, middleName } = splitFullName(params.fullName);

  const saveResp = await npRequest<NpCounterpartySaveRow[]>("Counterparty", "save", {
    CounterpartyProperty: "Recipient",
    CounterpartyType: "PrivatePerson",
    FirstName: firstName,
    LastName: lastName,
    MiddleName: middleName,
    Phone: params.phoneDigits,
    CityRef: params.cityRef,
  });

  const recipientRef = saveResp.data?.[0]?.Ref;
  if (!saveResp.success || !recipientRef) {
    return {
      error:
        (saveResp.errors ?? []).join("; ") ||
        "Не вдалося створити/отримати Recipient у НП",
    };
  }

  const contactResp = await npRequest<NpContactPersonsRow[]>(
    "Counterparty",
    "getCounterpartyContactPersons",
    { Ref: recipientRef }
  );
  const contactRef = contactResp.data?.[0]?.Ref;
  if (!contactResp.success || !contactRef) {
    return {
      error:
        (contactResp.errors ?? []).join("; ") ||
        "Не вдалося отримати ContactRecipient у НП",
    };
  }

  return { recipientRef, contactRef };
}

export function isNovaPoshtaConfiguredForTtn(): boolean {
  const k = getApiKey();
  if (!k) return false;
  const sender = process.env.NOVA_POSHTA_SENDER_REF?.trim();
  const citySender = process.env.NOVA_POSHTA_CITY_SENDER_REF?.trim();
  const wh = process.env.NOVA_POSHTA_SENDER_WAREHOUSE_REF?.trim();
  const contact = process.env.NOVA_POSHTA_CONTACT_SENDER_REF?.trim();
  const phone = process.env.NOVA_POSHTA_SENDERS_PHONE?.trim();
  return !!(sender && citySender && wh && contact && phone);
}

export type CreateTtnParams = {
  recipientName: string;
  recipientPhone: string;
  /** Назва міста з довідника НП */
  cityName: string;
  /** Опис відділення / поштомату з довідника */
  warehouseDescription: string;
  /** Ref населеного пункту (getCities → Ref) — надійніше за назву */
  cityRef?: string | null;
  /** Ref відділення (getWarehouses → Ref) */
  warehouseRef?: string | null;
  /** Оціночна вартість, грн */
  cost: number;
  /** Текст накладної */
  description: string;
  /** WarehouseWarehouse | WarehouseDoors … */
  serviceType?: string;
};

/** Результат InternetDocument.save — перший елемент data[] */
type SaveInternetDocumentRow = {
  IntDocNumber?: string;
  Ref?: string;
};

/**
 * Створює ЕН (ТТН) від відділення відправника до відділення отримувача.
 */
export async function createNovaPoshtaTtn(
  params: CreateTtnParams
): Promise<{ ttn: string; documentRef?: string } | { error: string }> {
  if (!isNovaPoshtaConfiguredForTtn()) {
    return {
      error:
        "NP TTN: задайте NOVA_POSHTA_API_KEY та NOVA_POSHTA_SENDER_REF, NOVA_POSHTA_CITY_SENDER_REF, NOVA_POSHTA_SENDER_WAREHOUSE_REF, NOVA_POSHTA_CONTACT_SENDER_REF, NOVA_POSHTA_SENDERS_PHONE",
    };
  }

  const senderPhone = normalizeNpPhone(process.env.NOVA_POSHTA_SENDERS_PHONE!);
  const recipientPhone = normalizeNpPhone(params.recipientPhone);

  const serviceType =
    params.serviceType ??
    (params.warehouseRef ? "WarehouseWarehouse" : "WarehouseWarehouse");

  // Якщо з фронта не прийшли Ref-и (користувач вводив руками) — резолвимо їх на сервері.
  const cityRef =
    params.cityRef?.trim() ||
    (await resolveCityRefByName(params.cityName).catch(() => null)) ||
    "";
  const warehouseRef =
    params.warehouseRef?.trim() ||
    (cityRef
      ? await resolveWarehouseRefByText(cityRef, params.warehouseDescription).catch(
          () => null
        )
      : null) ||
    "";

  if (!cityRef || !warehouseRef) {
    return {
      error:
        "CityRecipient not selected; RecipientAddress not selected (не вдалося визначити Ref міста/відділення). Виберіть місто/відділення зі списку або перевірте дані.",
    };
  }

  const ensured = await ensureRecipientCounterparty({
    fullName: params.recipientName,
    phoneDigits: recipientPhone,
    cityRef,
  });
  if ("error" in ensured) return { error: ensured.error };

  const methodProperties: Record<string, unknown> = {
    Sender: process.env.NOVA_POSHTA_SENDER_REF,
    CitySender: process.env.NOVA_POSHTA_CITY_SENDER_REF,
    SenderAddress: process.env.NOVA_POSHTA_SENDER_WAREHOUSE_REF,
    ContactSender: process.env.NOVA_POSHTA_CONTACT_SENDER_REF,
    SendersPhone: senderPhone,
    RecipientsPhone: recipientPhone,
    RecipientName: params.recipientName.trim(),
    ServiceType: serviceType,
    PaymentMethod: process.env.NOVA_POSHTA_PAYMENT_METHOD?.trim() || "Cash",
    PayerType: process.env.NOVA_POSHTA_PAYER_TYPE?.trim() || "Recipient",
    Cost: String(Math.max(1, Math.round(params.cost))),
    SeatsAmount: "1",
    Description: params.description.slice(0, 100),
    CargoType: process.env.NOVA_POSHTA_CARGO_TYPE?.trim() || "Parcel",
    Weight: "1",
    VolumeGeneral: "0.0004",
  };

  methodProperties.Recipient = ensured.recipientRef;
  methodProperties.ContactRecipient = ensured.contactRef;
  methodProperties.CityRecipient = cityRef;
  methodProperties.RecipientAddress = warehouseRef;

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  methodProperties.DateTime = `${dd}.${mm}.${yyyy}`;

  const resp = await npRequest<SaveInternetDocumentRow[]>(
    "InternetDocument",
    "save",
    methodProperties
  );

  if (!resp.success || !resp.data?.[0]) {
    const msg = [...(resp.errors ?? []), ...(resp.warnings ?? [])].join(
      "; "
    ) || "Nova Poshta save failed";
    return { error: msg };
  }

  const row = resp.data[0];
  const ttn = row.IntDocNumber?.replace(/\D/g, "") ?? "";
  if (!ttn) {
    return { error: "NP відповідь без номера ТТН" };
  }
  return { ttn, documentRef: row.Ref };
}

export type TrackingRow = {
  Number?: string;
  Status?: string;
  StatusCode?: string;
  WarehouseRecipient?: string;
  ScheduledDeliveryDate?: string;
};

/**
 * Статус доставки за номером ТТН (для кабінету).
 */
export async function getNovaPoshtaTracking(
  ttn: string,
  recipientPhone?: string | null
): Promise<{ code: string | null; name: string | null; raw?: TrackingRow } | null> {
  const clean = ttn.replace(/\D/g, "");
  if (!clean) return null;

  const doc: { DocumentNumber: string; Phone?: string } = {
    DocumentNumber: clean,
  };
  if (recipientPhone) {
    doc.Phone = normalizeNpPhone(recipientPhone);
  }

  const tryModels = ["TrackingDocument", "TrackingDocumentGeneral"] as const;
  for (const modelName of tryModels) {
    const resp = await npRequest<TrackingRow[]>(modelName, "getStatusDocuments", {
      Documents: [doc],
    });
    if (resp.success && resp.data?.[0]) {
      const r = resp.data[0];
      return {
        code: r.StatusCode ?? null,
        name: r.Status ?? null,
        raw: r,
      };
    }
  }
  return null;
}
