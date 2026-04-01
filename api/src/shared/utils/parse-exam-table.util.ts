import { escapeXml, stripHtml } from './parse-exam-html.util';
import { normalizeWhitespace } from './parse-exam-text.util';

export function wrapSvgText(text: string, maxCharsPerLine = 26) {
  const normalized = normalizeWhitespace(text);
  if (!normalized) return [''];
  const words = normalized.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxCharsPerLine) current = next;
    else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 5);
}

export function createTableSvgDataUrl(rows: string[][]) {
  const sanitizedRows = rows
    .map((row) => row.map((cell) => normalizeWhitespace(cell)))
    .filter((row) => row.some(Boolean));
  if (sanitizedRows.length === 0) return '';

  const columnCount = Math.max(...sanitizedRows.map((row) => row.length), 1);
  const columnWidth = 240;
  const rowHeights = sanitizedRows.map((row) => {
    const maxWrappedLines = Math.max(
      ...Array.from(
        { length: columnCount },
        (_, index) => wrapSvgText(row[index] ?? '').length,
      ),
      1,
    );
    return Math.max(34, 20 + maxWrappedLines * 18);
  });

  const width = columnCount * columnWidth;
  const height = rowHeights.reduce((sum, rowHeight) => sum + rowHeight, 0);
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="${width}" height="${height}" fill="#ffffff" />`,
  ];

  let y = 0;
  for (let rowIndex = 0; rowIndex < sanitizedRows.length; rowIndex += 1) {
    const row = sanitizedRows[rowIndex];
    const rowHeight = rowHeights[rowIndex];
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      const x = columnIndex * columnWidth;
      const wrapped = wrapSvgText(row[columnIndex] ?? '').map(escapeXml);
      parts.push(
        `<rect x="${x}" y="${y}" width="${columnWidth}" height="${rowHeight}" fill="${rowIndex === 0 ? '#f3f6fb' : '#ffffff'}" stroke="#cfd8e3" />`,
      );
      wrapped.forEach((line, lineIndex) => {
        parts.push(
          `<text x="${x + 10}" y="${y + 24 + lineIndex * 18}" font-family="Arial, sans-serif" font-size="14" fill="#1a1a2e">${line}</text>`,
        );
      });
    }
    y += rowHeight;
  }

  parts.push('</svg>');
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(parts.join(''))}`;
}

export function convertTableHtmlToImage(tableHtml: string) {
  const rowMatches = [...tableHtml.matchAll(/<tr[\s\S]*?>([\s\S]*?)<\/tr>/gi)];
  const rows = rowMatches.map((rowMatch) => {
    const cellMatches = [
      ...rowMatch[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi),
    ];
    return cellMatches.map((cellMatch) => stripHtml(cellMatch[1]));
  });
  return createTableSvgDataUrl(rows);
}
