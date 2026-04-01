export function normalizeWhitespace(value: string) {
  return value
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .trim();
}

export function normalizePreservingLines(value: string) {
  return value
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/\u00a0/g, ' ')
    .split('\n')
    .map((line) => line.replace(/[ ]{2,}/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function isPageChromeLine(line: string) {
  const text = normalizeWhitespace(line);
  if (!text) return true;
  if (/^\d+$/.test(text)) return true;
  if (/^[ivxlcdm]+$/i.test(text)) return true;
  if (/^(page|хуудас)\s*\d+$/i.test(text)) return true;
  if (/^хувилбар\s*[a-zа-яёөү0-9]+$/i.test(text)) return true;
  if (
    /^(элсэлтийн\s*шалгалт|ерөнхий\s*шалгалт|улсын\s*шалгалт|шалгалт)\s*\d{4}$/i.test(
      text,
    )
  )
    return true;
  return false;
}

export function stripRepeatedPageChrome(text: string) {
  const normalized = normalizePreservingLines(text);
  if (!normalized) return normalized;
  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const counts = new Map<string, number>();

  for (const line of lines) {
    const key = normalizeWhitespace(line).toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return lines
    .filter((line) => {
      const key = normalizeWhitespace(line).toLowerCase();
      const repeated = (counts.get(key) ?? 0) >= 2;
      const shortish = key.length <= 60;
      if (isPageChromeLine(line)) return false;
      if (
        repeated &&
        shortish &&
        /^(элсэлтийн\s*шалгалт|ерөнхий\s*шалгалт|улсын\s*шалгалт|хувилбар|page|хуудас|\d+$)/i.test(
          key,
        )
      ) {
        return false;
      }
      return true;
    })
    .join('\n');
}
