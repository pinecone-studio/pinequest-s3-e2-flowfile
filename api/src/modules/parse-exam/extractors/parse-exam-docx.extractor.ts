import mammoth from 'mammoth';
import { decodeHtmlEntities } from '../../../shared/utils/parse-exam-html.util';
import { convertTableHtmlToImage } from '../../../shared/utils/parse-exam-table.util';
import {
  normalizePreservingLines,
  stripRepeatedPageChrome,
} from '../../../shared/utils/parse-exam-text.util';

interface MammothHtmlResult {
  value: string;
}

function isMammothHtmlResult(value: unknown): value is MammothHtmlResult {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const result = value as Record<string, unknown>;

  return typeof result.value === 'string';
}

export async function extractDocxContent(buffer: Buffer) {
  const tableImages: Record<string, string> = {};
  const htmlResult: unknown = await mammoth.convertToHtml({ buffer });
  if (!isMammothHtmlResult(htmlResult)) {
    throw new TypeError('DOCX parser returned an unexpected HTML result.');
  }

  let tableIndex = 0;

  const htmlWithMarkers = htmlResult.value.replace(
    /<table[\s\S]*?<\/table>/gi,
    (tableHtml) => {
      tableIndex += 1;
      const marker = `[TABLE_IMAGE_${tableIndex}]`;
      const imageUrl = convertTableHtmlToImage(tableHtml);
      if (imageUrl) tableImages[marker] = imageUrl;
      return `\n${marker}\n`;
    },
  );

  const text = decodeHtmlEntities(
    htmlWithMarkers
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|tr|h1|h2|h3|h4|h5|h6)>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  );

  return {
    text: stripRepeatedPageChrome(normalizePreservingLines(text)),
    tableImages,
  };
}
