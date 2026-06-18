/** Останній сегмент шляху підкатегорії: «13 v PLUS / Легінси» → «Легінси» */
export function subcategoryLeafName(name: string): string {
  const parts = name.split(/\s*\/\s*/).filter(Boolean);
  return parts[parts.length - 1]?.trim() || name.trim();
}

/** Умови Prisma для пошуку підкатегорії за повною або короткою назвою */
export function subcategoryNameWhere(name: string) {
  const trimmed = name.trim();
  const leaf = subcategoryLeafName(trimmed);

  const conditions: Array<{
    name: { equals: string; mode: "insensitive" } | { endsWith: string; mode: "insensitive" };
  }> = [
    { name: { equals: trimmed, mode: "insensitive" } },
  ];

  if (leaf !== trimmed) {
    conditions.push({
      name: { endsWith: ` / ${leaf}`, mode: "insensitive" },
    });
  }

  return conditions;
}
