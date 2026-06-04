/** Парсинг назв товарів KeyCRM: розмір, колір, ключі групування. */

const SIZE_PROP_NAMES = new Set(["розмір", "size", "размер"]);
const COLOR_PROP_NAMES = new Set(["колір", "color", "цвет"]);

const SIZE_TOKEN =
  "(?:XXS|XXXL|XXL|XL|XS|[SML]|\\d{2,3})(?:[-/\\\\](?:XXS|XXXL|XXL|XL|XS|[SML]|\\d{1,3}XL?|\\d{2,3}))?";

/** Розмір у дужках в кінці: «Халат "Kvitni" (S/М)», «… (L-XL)» */
const SIZE_IN_PARENS_SUFFIX = /\(([^()]+)\)\s*$/;

/** Розмір в кінці: «… XXS-XS», «… S-M», «… S/M», «… S\M», «… XS» */
const SIZE_TRAILING_COMPOUND = new RegExp(
  `\\s(${SIZE_TOKEN})\\s*$`,
  "i"
);

function extractTrailingColor(
  name: string
): { label: string; hex: string; matchedText: string; stripLength: number } | null {
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  let best: {
    label: string;
    hex: string;
    matchedText: string;
    stripLength: number;
    len: number;
  } | null = null;

  for (const entry of COLOR_STEMS) {
    for (const stem of entry.stems) {
      if (!lower.endsWith(stem)) continue;
      const start = trimmed.length - stem.length;
      if (start > 0 && trimmed[start - 1] !== " ") continue;
      const stripLength = trimmed.length - start;
      if (!best || stem.length > best.len) {
        best = {
          label: entry.label,
          hex: entry.hex,
          matchedText: trimmed.slice(start),
          stripLength,
          len: stem.length,
        };
      }
    }
  }

  return best
    ? {
        label: best.label,
        hex: best.hex,
        matchedText: best.matchedText,
        stripLength: best.stripLength,
      }
    : null;
}

function tryExtractTrailingSize(
  name: string
): { size: string; stripLength: number } | null {
  const trimmed = name.trim();

  const inParens = trimmed.match(SIZE_IN_PARENS_SUFFIX);
  if (inParens?.[1]) {
    const size = normalizeSizeLabel(inParens[1]);
    if (size) {
      return { size, stripLength: inParens[0].length };
    }
  }

  const compound = trimmed.match(SIZE_TRAILING_COMPOUND);
  if (compound?.[1]) {
    return {
      size: normalizeSizeLabel(compound[1]),
      stripLength: compound[0].length,
    };
  }

  return null;
}

/** Варіант у назві після моделі: «з сірим кантом», «з чорним кантом» */
const VARIANT_TAIL_PATTERNS = [
  /\s+з\s+(?:[^\s]+\s+){0,4}кант(?:ом|у)?\s*$/i,
  /\s+з\s+(?:[^\s]+\s+){0,4}пір(?:ʼ|')?(?:ям|я)?\s*$/i,
];

/** Відомі кольори (довші / специфічні — раніше) */
const COLOR_STEMS: Array<{ stems: string[]; label: string; hex: string }> = [
  { stems: ["сіро-блакитний", "сіро блакитний", "сіро-блакитна"], label: "сіро-блакитний", hex: "#8FB8C8" },
  { stems: ["сіро-рожевий", "сіро рожевий"], label: "сіро-рожевий", hex: "#D8A8B8" },
  { stems: ["бордо"], label: "бордо", hex: "#8B0034" },
  { stems: ["марсала"], label: "марсала", hex: "#955251" },
  { stems: ["капучино"], label: "капучино", hex: "#C4A484" },
  { stems: ["шоколадний", "шоколадна", "шоколад"], label: "шоколад", hex: "#3D2314" },
  { stems: ["персиковий", "персикова", "персикове"], label: "персиковий", hex: "#FFCBA4" },
  { stems: ["блакитний", "блакитна", "блакитне"], label: "блакитний", hex: "#87CEEB" },
  { stems: ["молочний", "молочна", "молочне"], label: "молочний", hex: "#FFF8E7" },
  { stems: ["кремовий", "кремова", "кремове"], label: "кремовий", hex: "#FFFDD0" },
  { stems: ["оливковий", "оливкова", "оливкове"], label: "оливковий", hex: "#808000" },
  { stems: ["фіолетовий", "фіолетова", "фіолетове"], label: "фіолетовий", hex: "#8B008B" },
  { stems: ["коричневий", "коричнева", "коричневе"], label: "коричневий", hex: "#8B4513" },
  { stems: ["меланж"], label: "меланж", hex: "#B0B0B0" },
  { stems: ["чорний", "чорна", "чорне", "чорно"], label: "чорний", hex: "#1A1A1A" },
  { stems: ["білий", "біла", "біле"], label: "білий", hex: "#FFFFFF" },
  { stems: ["сірий", "сіра", "сірі", "сіро"], label: "сірий", hex: "#808080" },
  { stems: ["рожевий", "рожева", "рожеве"], label: "рожевий", hex: "#FFB6C1" },
  { stems: ["синій", "синя", "синє"], label: "синій", hex: "#0047AB" },
  { stems: ["зелений", "зелена", "зелене"], label: "зелений", hex: "#228B22" },
  { stems: ["червоний", "червона", "червоне"], label: "червоний", hex: "#DC143C" },
  { stems: ["жовтий", "жовта", "жовте"], label: "жовтий", hex: "#FFD700" },
  { stems: ["бежевий", "бежева", "бежеве", "беж"], label: "бежевий", hex: "#F5F5DC" },
  { stems: ["хакі"], label: "хакі", hex: "#6B6B47" },
  { stems: ["помаранчевий", "помаранчева", "помаранчеве"], label: "помаранчевий", hex: "#FF8C00" },
];

export { SIZE_PROP_NAMES, COLOR_PROP_NAMES };

export function normalizeSizeLabel(size: string): string {
  return size.trim().replace(/\\/g, "/");
}

export function extractSizeSuffix(
  name: string
): { size: string; stripLength: number } | null {
  const trimmed = name.trim();
  const trailingColor = extractTrailingColor(trimmed);
  const withoutColor = trailingColor
    ? trimmed.slice(0, trimmed.length - trailingColor.stripLength).trim()
    : trimmed;

  const extracted = tryExtractTrailingSize(withoutColor);
  if (!extracted) return null;

  return {
    size: extracted.size,
    stripLength: extracted.stripLength + (trailingColor?.stripLength ?? 0),
  };
}

export function sizeFromName(name: string): string | null {
  return extractSizeSuffix(name)?.size ?? null;
}

export function stripSizeFromName(name: string): string {
  const trimmed = name.trim();
  const extracted = extractSizeSuffix(trimmed);
  if (extracted) {
    return trimmed.slice(0, trimmed.length - extracted.stripLength).trim();
  }
  return trimmed;
}

export function extractColorFromName(
  name: string
): { label: string; hex: string; matchedText: string } | null {
  const trailing = extractTrailingColor(name.trim());
  if (trailing) {
    return {
      label: trailing.label,
      hex: trailing.hex,
      matchedText: trailing.matchedText,
    };
  }

  const haystack = stripSizeFromName(name).toLowerCase();
  let best: { label: string; hex: string; matchedText: string; len: number } | null =
    null;

  for (const entry of COLOR_STEMS) {
    for (const stem of entry.stems) {
      const idx = haystack.indexOf(stem);
      if (idx < 0) continue;
      if (!best || stem.length > best.len) {
        best = {
          label: entry.label,
          hex: entry.hex,
          matchedText: stem,
          len: stem.length,
        };
      }
    }
  }

  return best
    ? { label: best.label, hex: best.hex, matchedText: best.matchedText }
    : null;
}

export function stripColorFromName(name: string): string {
  const color = extractColorFromName(name);
  if (!color) return name.trim();
  return name
    .replace(new RegExp(color.matchedText, "i"), " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Без розміру та «з … кантом» — для групування розмірів одного кольору */
export function modelNameFromKeycrmName(name: string): string {
  let n = stripSizeFromName(name);
  n = n.replace(/,\s*$/, "").trim();
  for (const pattern of VARIANT_TAIL_PATTERNS) {
    n = n.replace(pattern, "").trim();
  }
  return n;
}

/** Без розміру та кольору — для звʼязку варіантів різного кольору (Easy, GRACE) */
export function variantGroupKeyFromName(name: string): string {
  const n = stripColorFromName(modelNameFromKeycrmName(name));
  return n.toLowerCase().replace(/\s+/g, " ").trim();
}

export function productGroupKey(name: string): string {
  return modelNameFromKeycrmName(name).toLowerCase().replace(/\s+/g, " ");
}

export function variantLabelFromName(
  fullName: string,
  modelName: string
): string | null {
  const withoutSize = stripSizeFromName(fullName);
  const variant = withoutSize.slice(modelName.length).trim();
  if (!variant) return null;
  const m = variant.match(/^з\s+(.+)$/i);
  return (m?.[1] ?? variant).trim() || null;
}

export function colorFromProductName(
  fullName: string,
  modelName: string
): { label: string; hex: string | null } | null {
  const fromName = extractColorFromName(fullName);
  if (fromName) {
    return { label: fromName.label, hex: fromName.hex };
  }

  const variant = variantLabelFromName(fullName, modelName);
  if (!variant) return null;

  const fromVariant = extractColorFromName(variant);
  if (fromVariant) {
    return { label: fromVariant.label, hex: fromVariant.hex };
  }

  return { label: variant, hex: null };
}

/** Артикул типу 1301148 — не розмір */
export function sizeFromSku(sku: string | null | undefined): string | null {
  if (!sku?.trim()) return null;
  const value = sku.trim();
  if (/^\d{4,}$/.test(value)) return null;
  return value;
}

export function propValue(
  props: Array<{ name: string; value: string }> | null | undefined,
  names: Set<string>
): string | null {
  if (!props?.length) return null;
  for (const p of props) {
    if (names.has(p.name.trim().toLowerCase())) {
      const v = p.value?.trim();
      if (v) return v;
    }
  }
  return null;
}
