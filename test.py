#!/usr/bin/env python3
"""
Скрипт для отримання всіх необхідних рефів Нової Пошти
для ФОП Чередюк Владислав Русланович
"""

import json
import urllib.request
import urllib.error

API_KEY = "ecc91d40e6c562bc31f093a40ef660e0"
BASE_URL = "https://api.novaposhta.ua/v2.0/json/"

PHONE = "380507841855"  # +38 (050) 784-18-55
CITY_NAME = "Чернівці"
WAREHOUSE_NUMBER = "1"  # НП№1


def api_call(model, method, props=None):
    payload = {
        "apiKey": API_KEY,
        "modelName": model,
        "calledMethod": method,
        "methodProperties": props or {}
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        BASE_URL,
        data=data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def find_city_ref(city_name):
    print(f"\n🔍 Шукаємо місто: {city_name}")
    result = api_call("Address", "getCities", {"FindByString": city_name})
    if not result.get("success") or not result.get("data"):
        print("  ❌ Місто не знайдено")
        return None
    # Знайти точний збіг
    for city in result["data"]:
        if city.get("Description") == city_name or city.get("DescriptionRu") == city_name:
            ref = city["Ref"]
            print(f"  ✅ {city.get('Description')} / {city.get('DescriptionRu')} → {ref}")
            return ref
    # Якщо точного збігу нема — повернути перший
    city = result["data"][0]
    ref = city["Ref"]
    print(f"  ✅ {city.get('Description')} / {city.get('DescriptionRu')} → {ref}")
    return ref


def find_warehouse_ref(city_ref, warehouse_number):
    print(f"\n🔍 Шукаємо відділення №{warehouse_number} у місті...")
    result = api_call("Address", "getWarehouses", {
        "CityRef": city_ref,
        "WarehouseId": warehouse_number
    })
    if not result.get("success") or not result.get("data"):
        print("  ❌ Відділення не знайдено")
        return None
    for wh in result["data"]:
        num = wh.get("Number", "")
        if str(num) == str(warehouse_number):
            ref = wh["Ref"]
            print(f"  ✅ №{num}: {wh.get('Description')} → {ref}")
            return ref
    # Перше знайдене
    wh = result["data"][0]
    ref = wh["Ref"]
    print(f"  ✅ №{wh.get('Number')}: {wh.get('Description')} → {ref}")
    return ref


def find_counterparty_and_contacts(phone):
    print(f"\n🔍 Шукаємо контрагента за телефоном: {phone}")
    result = api_call("Counterparty", "getCounterparties", {
        "CounterpartyProperty": "Sender",
        "Page": "1"
    })
    if not result.get("success"):
        print("  ❌ Помилка отримання контрагентів:", result.get("errors"))
        return None, None

    sender_ref = None
    for cp in result.get("data", []):
        # Перевіряємо контакти кожного контрагента
        contacts_result = api_call("Counterparty", "getCounterpartyContactPersons", {
            "Ref": cp["Ref"]
        })
        for contact in contacts_result.get("data", []):
            phones = contact.get("Phones", "").replace(" ", "").replace("+", "").replace("-", "")
            if phone.replace("+", "") in phones or phone in phones:
                sender_ref = cp["Ref"]
                contact_ref = contact["Ref"]
                print(f"  ✅ Контрагент: {cp.get('Description')} → {sender_ref}")
                print(f"  ✅ Контакт: {contact.get('Description')} → {contact_ref}")
                return sender_ref, contact_ref

    print("  ⚠️  Не знайдено за телефоном, шукаємо за ім'ям...")
    for cp in result.get("data", []):
        desc = cp.get("Description", "").lower()
        if "чередюк" in desc or "vladyslav" in desc.lower() or "vladislav" in desc.lower():
            sender_ref = cp["Ref"]
            print(f"  ✅ Контрагент: {cp.get('Description')} → {sender_ref}")
            # Отримати перший контакт
            contacts_result = api_call("Counterparty", "getCounterpartyContactPersons", {
                "Ref": sender_ref
            })
            contacts = contacts_result.get("data", [])
            if contacts:
                contact_ref = contacts[0]["Ref"]
                print(f"  ✅ Контакт: {contacts[0].get('Description')} → {contact_ref}")
                return sender_ref, contact_ref
            return sender_ref, None

    print("  ❌ Контрагента не знайдено")
    return None, None


def main():
    print("=" * 60)
    print("  Nova Poshta — отримання рефів відправника")
    print("=" * 60)

    # 1. Місто відправлення
    city_ref = find_city_ref(CITY_NAME)

    # 2. Відділення відправлення
    warehouse_ref = None
    if city_ref:
        warehouse_ref = find_warehouse_ref(city_ref, WAREHOUSE_NUMBER)

    # 3. Контрагент та контакт
    sender_ref, contact_ref = find_counterparty_and_contacts(PHONE)

    # Підсумок
    print("\n" + "=" * 60)
    print("  .env конфігурація:")
    print("=" * 60)
    print(f"NOVA_POSHTA_API_KEY={API_KEY}")
    print(f"NOVA_POSHTA_SENDER_REF={sender_ref or '❌ не знайдено'}")
    print(f"NOVA_POSHTA_CITY_SENDER_REF={city_ref or '❌ не знайдено'}")
    print(f"NOVA_POSHTA_SENDER_WAREHOUSE_REF={warehouse_ref or '❌ не знайдено'}")
    print(f"NOVA_POSHTA_CONTACT_SENDER_REF={contact_ref or '❌ не знайдено'}")
    print(f"NOVA_POSHTA_SENDERS_PHONE={PHONE}")
    print("=" * 60)


if __name__ == "__main__":
    main()