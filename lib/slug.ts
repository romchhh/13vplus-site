/**
 * Транслітерація українських літер у латиницю для ЧПУ (slug).
 * Використовується для product та category URL.
 */

const UA_TO_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ye", ж: "zh", з: "z",
  и: "y", і: "i", ї: "yi", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p",
  р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
  щ: "shch", ь: "", ю: "yu", я: "ya",
  А: "a", Б: "b", В: "v", Г: "h", Ґ: "g", Д: "d", Е: "e", Є: "ye", Ж: "zh", З: "z",
  И: "y", І: "i", Ї: "yi", Й: "y", К: "k", Л: "l", М: "m", Н: "n", О: "o", П: "p",
  Р: "r", С: "s", Т: "t", У: "u", Ф: "f", Х: "kh", Ц: "ts", Ч: "ch", Ш: "sh",
  Щ: "shch", Ь: "", Ю: "yu", Я: "ya",
};

/**
 * Перетворює український текст на латинський (транслітерація).
 */
export function transliterateUaToEn(text: string): string {
  return text
    .split("")
    .map((char) => UA_TO_LATIN[char] ?? char)
    .join("");
}

/**
 * Генерує URL-slug з тексту: транслітерація, lowercase, заміна пробілів на дефіс, видалення зайвих символів.
 */
export function textToSlug(text: string): string {
  const transliterated = transliterateUaToEn(text);
  const slug = transliterated
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "item";
}

/**
 * Повертає унікальний slug: якщо baseSlug вже зайнятий, додає суфікс -2, -3, ...
 * checkExists(slug) має повертати true, якщо slug вже зайнятий (при оновленні — виключайте поточний запис у checkExists).
 */
export async function ensureUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = baseSlug;
  let counter = 2;
  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
  return slug;
}
