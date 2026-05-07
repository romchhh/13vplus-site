import requests

API_KEY = "6d18d02d0679fe306294e6415c08daef"
BASE_URL = "https://api.novaposhta.ua/v2.0/json/"

def np_request(model, method, props={}):
    payload = {
        "apiKey": API_KEY,
        "modelName": model,
        "calledMethod": method,
        "methodProperties": props
    }
    r = requests.post(BASE_URL, json=payload)
    data = r.json()
    if not data.get("success"):
        print(f"Помилка: {data.get('errors')}")
        return []
    return data.get("data", [])

# 1. Контрагенти
print("=" * 60)
print("КОНТРАГЕНТИ (ВІДПРАВНИКИ)")
print("=" * 60)
counterparties = np_request("Counterparty", "getCounterparties", {
    "CounterpartyProperty": "Sender",
    "Page": "1"
})
for cp in counterparties:
    print(f"Назва: {cp.get('Description')}")
    print(f"  Ref: {cp.get('Ref')}")
    print(f"  ЄДРПОУ/ІПН: {cp.get('EDRPOU')}")
    print()

# 2. Контактні особи
print("=" * 60)
print("КОНТАКТНІ ОСОБИ ВІДПРАВНИКА")
print("=" * 60)
for cp in counterparties:
    contacts = np_request("Counterparty", "getCounterpartyContactPersons", {
        "Ref": cp.get("Ref"),
        "Page": "1"
    })
    print(f"Контрагент: {cp.get('Description')} ({cp.get('Ref')})")
    seen = set()
    for c in contacts:
        ref = c.get('Ref')
        if ref not in seen:
            seen.add(ref)
            print(f"  Ім'я: {c.get('Description')}")
            print(f"  Ref контакту: {c.get('Ref')}")
            print(f"  Телефон: {c.get('Phones')}")
    print()

# 3. Місто Київ
print("=" * 60)
print("ПОШУК МІСТА (Київ)")
print("=" * 60)
cities = np_request("Address", "getCities", {"FindByString": "Київ", "Page": "1"})
kyiv_ref = None
for city in cities:
    if city.get("Description") == "Київ" and city.get("AreaDescription") == "Київська":
        kyiv_ref = city.get("Ref")
        print(f"Місто: {city.get('Description')}")
        print(f"  Ref: {kyiv_ref}")
        break
print()

# 4. Відділення №99 (Салютна 5Б)
print("=" * 60)
print("ВІДДІЛЕННЯ ВІДПРАВЛЕННЯ")
print("=" * 60)
if kyiv_ref:
    warehouses = np_request("Address", "getWarehouses", {
        "CityRef": kyiv_ref,
        "WarehouseId": "99",  # фільтр по номеру
        "Page": "1"
    })
    for wh in warehouses:
        if wh.get("Number") == "99" and "Салютна" in wh.get("Description", ""):
            print(f"Відділення: {wh.get('Description')}")
            print(f"  Ref: {wh.get('Ref')}")
            print(f"  Номер: {wh.get('Number')}")
            print(f"  Адреса: {wh.get('ShortAddress')}")
    print()

# 5. Підсумок для .env
print("=" * 60)
print("ПІДСУМОК ДЛЯ .env")
print("=" * 60)
if counterparties:
    cp = counterparties[0]
    contacts = np_request("Counterparty", "getCounterpartyContactPersons", {
        "Ref": cp.get("Ref"), "Page": "1"
    })
    contact = contacts[0] if contacts else {}
    
    wh_ref = None
    if kyiv_ref:
        warehouses = np_request("Address", "getWarehouses", {
            "CityRef": kyiv_ref, "WarehouseId": "99"
        })
        for wh in warehouses:
            if wh.get("Number") == "99" and "Салютна" in wh.get("Description", ""):
                wh_ref = wh.get("Ref")
                break

    print(f"NOVA_POSHTA_SENDER_REF={cp.get('Ref')}")
    print(f"NOVA_POSHTA_CITY_SENDER_REF={kyiv_ref}")
    print(f"NOVA_POSHTA_SENDER_WAREHOUSE_REF={wh_ref}")
    print(f"NOVA_POSHTA_CONTACT_SENDER_REF={contact.get('Ref')}")
    print(f"NOVA_POSHTA_SENDERS_PHONE={contact.get('Phones')}")