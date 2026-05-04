/**
 * Об’єднує значення властивості варіантів з багаторядкового поля (ENTER)
 * та кольори, додані з палітри (з hex).
 */
export function mergeVariantColorsFromInputs(
  linesText: string,
  swatches: { label: string; hex?: string | null }[]
): { label: string; hex?: string | null }[] {
  const map = new Map<string, { label: string; hex?: string | null }>();
  for (const line of linesText.split(/\r?\n/)) {
    const label = line.trim();
    if (!label) continue;
    const key = label.toLowerCase();
    if (!map.has(key)) map.set(key, { label, hex: null });
  }
  for (const c of swatches) {
    const label = c.label.trim();
    if (!label) continue;
    const key = label.toLowerCase();
    const prev = map.get(key);
    map.set(key, { label, hex: c.hex ?? prev?.hex ?? null });
  }
  return Array.from(map.values());
}
