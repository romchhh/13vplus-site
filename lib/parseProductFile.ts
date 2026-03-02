/**
 * Parses product page text (from Word/PDF/TXT) into form fields.
 * Expects structure with Ukrainian section headers like in the example.
 */
export interface ParsedProduct {
  name?: string;
  subtitle?: string;
  mainInfo?: string;
  shortDescription?: string;
  description?: string;
  mainAction?: string;
  indicationsForUse?: string;
  benefits?: string;
  fullComposition?: string;
  usageMethod?: string;
  contraindications?: string;
  storageConditions?: string;
  price?: string;
  releaseForm?: string;
  course?: string;
  packageWeight?: string;
}

const SECTION_MARKERS: { key: keyof ParsedProduct; patterns: RegExp[] }[] = [
  { key: "subtitle", patterns: [/^Підзаголовок\s*$/m] },
  { key: "mainInfo", patterns: [/^Основна інформація\s*$/m] },
  { key: "shortDescription", patterns: [/^Короткий опис\s*$/m] },
  { key: "description", patterns: [/^Повний опис\s*$/m] },
  { key: "mainAction", patterns: [/^Основна дія програми\s*$/m, /^Основна дія\s*$/m] },
  { key: "indicationsForUse", patterns: [/^Коли рекомендується використовувати\s*$/m] },
  {
    key: "fullComposition",
    patterns: [
      /^Склад програми \(повний\)\s*$/m,
      /^Дія компонентів програми\s*$/m,
      /^Склад програми\s*$/m,
    ],
  },
  { key: "usageMethod", patterns: [/^Схема використання\s*$/m] },
  { key: "benefits", patterns: [/^Переваги програми\s*$/m, /^Переваги\s*$/m] },
  { key: "contraindications", patterns: [/^Протипоказання\s*$/m] },
  { key: "storageConditions", patterns: [/^Умови зберігання\s*$/m] },
];

function trimBlock(s: string): string {
  return s.replace(/\n{3,}/g, "\n\n").trim();
}

function extractBetween(
  text: string,
  startMarker: RegExp,
  endIndex: number
): string {
  const m = text.match(startMarker);
  if (!m || m.index == null) return "";
  const start = m.index + m[0].length;
  const slice = text.slice(start, endIndex === -1 ? undefined : endIndex);
  return trimBlock(slice);
}

export function parseProductPageText(raw: string): ParsedProduct {
  const text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const result: ParsedProduct = {};

  // Product name: often first meaningful line after "СТОРІНКА ТОВАРУ" or at start
  const pageMatch = text.match(/СТОРІНКА ТОВАРУ\s*\n+([^\n]+)/);
  if (pageMatch) {
    result.name = pageMatch[1].trim();
  } else {
    const firstLines = text.split(/\n+/).filter((l) => l.trim().length > 0);
    if (firstLines.length > 0 && !SECTION_MARKERS.some((s) => s.patterns.some((p) => p.test(firstLines[0])))) {
      result.name = firstLines[0].trim();
    }
  }

  // Find positions of all section starts (with the pattern that matched)
  type Pos = { key: keyof ParsedProduct; index: number; pattern: RegExp };
  const positions: Pos[] = [];
  for (const { key, patterns } of SECTION_MARKERS) {
    for (const pattern of patterns) {
      const m = text.match(pattern);
      if (m && m.index != null) {
        positions.push({ key, index: m.index, pattern });
        // For fullComposition we want both "Склад програми" and "Дія компонентів" blocks; don't break
        if (key !== "fullComposition") break;
      }
    }
  }
  positions.sort((a, b) => a.index - b.index);

  for (let i = 0; i < positions.length; i++) {
    const { key, pattern } = positions[i];
    const nextIndex = i + 1 < positions.length ? positions[i + 1].index : -1;
    const content = extractBetween(
      text,
      pattern,
      nextIndex === -1 ? text.length : nextIndex
    );
    if (content) {
      if (key === "fullComposition" && (result.fullComposition as string | undefined)) {
        result.fullComposition = [result.fullComposition, content].join("\n\n");
      } else {
        (result as Record<string, string>)[key] = content;
      }
    }
  }

  // Parse "Основна інформація" block for price, type, course, etc.
  const mainBlock = result.mainInfo || "";
  const priceMatch = mainBlock.match(/Ціна:\s*(\d+)\s*грн/);
  if (priceMatch) result.price = priceMatch[1];
  const typeMatch = mainBlock.match(/Тип продукту:\s*([^\n]+)/);
  if (typeMatch) result.releaseForm = typeMatch[1].trim();
  const courseMatch = mainBlock.match(/Тривалість курсу:\s*([^\n]+)/);
  if (courseMatch) result.course = courseMatch[1].trim();
  const ageMatch = mainBlock.match(/Вік:\s*([^\n]+)/);
  if (ageMatch && !result.mainInfo?.includes("Вік:")) {
    // could append to mainInfo or leave as-is; mainInfo already has full block
  }
  const weightMatch = mainBlock.match(/Вага[^\n]*:\s*([^\n]+)/);
  if (weightMatch) result.packageWeight = weightMatch[1].trim();

  return result;
}
