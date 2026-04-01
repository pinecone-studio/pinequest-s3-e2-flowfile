import { PDFParse } from 'pdf-parse';
import {
  normalizePreservingLines,
  stripRepeatedPageChrome,
} from '../../../shared/utils/parse-exam-text.util';

interface PdfParserLike {
  destroy: () => Promise<void>;
  getText: () => Promise<unknown>;
}

interface PdfTextResultLike {
  text?: string;
}

function isPdfParserLike(value: unknown): value is PdfParserLike {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const parser = value as Record<string, unknown>;

  return (
    typeof parser.destroy === 'function' && typeof parser.getText === 'function'
  );
}

function isPdfTextResultLike(value: unknown): value is PdfTextResultLike {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const result = value as Record<string, unknown>;

  return result.text === undefined || typeof result.text === 'string';
}

export async function extractPdfContent(buffer: Buffer) {
  const parser: unknown = new PDFParse({ data: buffer });
  if (!isPdfParserLike(parser)) {
    throw new TypeError('PDF parser returned an unexpected parser instance.');
  }

  try {
    const extracted: unknown = await parser.getText();
    if (!isPdfTextResultLike(extracted)) {
      throw new TypeError('PDF parser returned an unexpected text result.');
    }

    return stripRepeatedPageChrome(
      normalizePreservingLines(extracted.text ?? ''),
    );
  } finally {
    await parser.destroy();
  }
}
