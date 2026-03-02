-- Створення категорій Choice + підкатегорій
-- Цей скрипт ПОВНІСТЮ замінює стару структуру:
-- 1) видаляє всі існуючі підкатегорії та категорії
-- 2) додає нові категорії та підкатегорії Choice

-- 0. Спочатку повністю очищаємо підкатегорії та категорії

DELETE FROM subcategories;
DELETE FROM categories;

-- 1. Категорії

INSERT INTO categories (name, slug, priority)
VALUES
  ('Очищення і детокс', 'ochyshchennia-detoks', 1),
  ('Імунітет і відновлення', 'imunitet-vidnovlennia', 2),
  ('Енергія, мозок і щоденна підтримка', 'enerhiia-mozok-shchodennia-pidtrymka', 3),
  ('Контроль ваги і метаболізм', 'kontrol-vahy-metabolizm', 4),
  ('Дитяче здоров’я', 'dytiache-zdorovia', 5),
  ('Набори і програми', 'nabory-prohramy', 6)
ON CONFLICT (slug) DO NOTHING;


-- 2. Підкатегорії для "Очищення і детокс"

WITH cat AS (
  SELECT id FROM categories WHERE slug = 'ochyshchennia-detoks'
)
INSERT INTO subcategories (name, slug, category_id)
SELECT name, slug, cat.id
FROM (
  VALUES
    ('детокс', 'detox'),
    ('антипаразитарний захист', 'antyparazytyarnyi-zakhyst'),
    ('протигрибковий захист', 'protyhrybkovyi-zakhyst'),
    ('очищення кишечника', 'ochyshchennia-kyshenyka'),
    ('очищення лімфи', 'ochyshchennia-lymfy'),
    ('підтримка печінки', 'pidtrymka-pechinky'),
    ('травлення', 'travlennia')
) AS s(name, slug)
CROSS JOIN cat
ON CONFLICT (slug) DO NOTHING;


-- 3. Підкатегорії для "Імунітет і відновлення"

WITH cat AS (
  SELECT id FROM categories WHERE slug = 'imunitet-vidnovlennia'
)
INSERT INTO subcategories (name, slug, category_id)
SELECT name, slug, cat.id
FROM (
  VALUES
    ('імунітет', 'imunitet'),
    ('антиоксидантний захист', 'antyoksydantnyi-zakhyst'),
    ('відновлення організму', 'vidnovlennia-orhanizmu'),
    ('підтримка після стресу або навантаження', 'pidtrymka-pislia-stresu-navantazhennia')
) AS s(name, slug)
CROSS JOIN cat
ON CONFLICT (slug) DO NOTHING;


-- 4. Підкатегорії для "Енергія, мозок і щоденна підтримка"

WITH cat AS (
  SELECT id FROM categories WHERE slug = 'enerhiia-mozok-shchodennia-pidtrymka'
)
INSERT INTO subcategories (name, slug, category_id)
SELECT name, slug, cat.id
FROM (
  VALUES
    ('енергія', 'enerhiia'),
    ('антистрес', 'antystres'),
    ('пам’ять і увага', 'pamiat-uvaha'),
    ('обмін речовин', 'obmin-rechovyn'),
    ('базові вітаміни', 'bazovi-vitaminy')
) AS s(name, slug)
CROSS JOIN cat
ON CONFLICT (slug) DO NOTHING;


-- 5. Підкатегорії для "Контроль ваги і метаболізм"

WITH cat AS (
  SELECT id FROM categories WHERE slug = 'kontrol-vahy-metabolizm'
)
INSERT INTO subcategories (name, slug, category_id)
SELECT name, slug, cat.id
FROM (
  VALUES
    ('програми корекції ваги', 'prohramy-korektsii-vahy'),
    ('контроль ваги', 'kontrol-vahy'),
    ('підтримка метаболізму', 'pidtrymka-metabolizmu'),
    ('детокс для зниження ваги', 'detox-dlia-znizhennia-vahy')
) AS s(name, slug)
CROSS JOIN cat
ON CONFLICT (slug) DO NOTHING;


-- 6. Підкатегорії для "Дитяче здоров’я"

WITH cat AS (
  SELECT id FROM categories WHERE slug = 'dytiache-zdorovia'
)
INSERT INTO subcategories (name, slug, category_id)
SELECT name, slug, cat.id
FROM (
  VALUES
    ('всі продукти для дітей', 'vsi-produkty-dlia-ditei')
) AS s(name, slug)
CROSS JOIN cat
ON CONFLICT (slug) DO NOTHING;


-- 7. Підкатегорії для "Набори і програми"

WITH cat AS (
  SELECT id FROM categories WHERE slug = 'nabory-prohramy'
)
INSERT INTO subcategories (name, slug, category_id)
SELECT name, slug, cat.id
FROM (
  VALUES
    ('антипаразитарна програма', 'antyparazytyarna-prohrama'),
    ('detox програми', 'detox-prohramy'),
    ('wellness набори', 'wellness-nabory'),
    ('комплексні курси', 'kompleksni-kursy')
) AS s(name, slug)
CROSS JOIN cat
ON CONFLICT (slug) DO NOTHING;

