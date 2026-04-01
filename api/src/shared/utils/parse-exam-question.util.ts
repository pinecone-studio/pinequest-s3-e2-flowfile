import {
  ImportedQuestionPayload,
  SectionType,
  SubjectProfile,
} from '../types/parse-exam.types';
import { normalizeWhitespace, isPageChromeLine } from './parse-exam-text.util';

export const QUESTION_POINTS_PATTERN = /\b(\d+)\s*-?\s*р?\s*оноо\b/gi;

export function extractPointsFromQuestionText(value: string) {
  const matches = [...value.matchAll(QUESTION_POINTS_PATTERN)];
  const lastMatch = matches.at(-1);
  return {
    points: lastMatch ? Math.max(1, Number(lastMatch[1]) || 10) : null,
    question: value
      .replace(QUESTION_POINTS_PATTERN, '')
      .replace(/\s{2,}/g, ' ')
      .trim(),
  };
}

export function detectSubjectProfile(input: {
  fileName?: string;
  title?: string;
  courseLabel?: string;
  fileText: string;
}): SubjectProfile {
  const haystack = normalizeWhitespace(
    [
      input.fileName,
      input.title,
      input.courseLabel,
      input.fileText.slice(0, 4000),
    ]
      .filter(Boolean)
      .join(' '),
  ).toLowerCase();
  if (/монгол\s*хэл|монгол\s*бичиг|уран\s*зохиол/.test(haystack))
    return 'mongolian_language';
  if (/англи\s*хэл|орос\s*хэл|language|listening|reading/.test(haystack))
    return 'language';
  if (/математик|алгебр|геометр|тэгшитгэл|функц/.test(haystack)) return 'math';
  if (/хими|chemical|equation|урвал|моль|элемент|период/.test(haystack))
    return 'chemistry';
  if (/физик|биологи|газарзүй|science|байгалийн\s*ухаан/.test(haystack))
    return 'science';
  if (/нийгэм|түүх|иргэн|эдийн\s*засаг|нийгмийн\s*ухаан/.test(haystack))
    return 'social_science';
  return 'generic';
}

export function isMetaLine(line: string) {
  return /^(батлав|сургалтын менежер|санамж|заавар|instructions?|answer sheet|түлхүүр|хариултын\s*хуудас|[a-zа-яёөү]\s*хувилбар|variant)\b/i.test(
    line.trim(),
  );
}

export function isSectionHeading(line: string) {
  return /^(нэгдүгээр\s*хэсэг|хоёрдугаар\s*хэсэг|гуравдугаар\s*хэсэг|дөрөвдүгээр\s*хэсэг|i+\s*хэсэг|ii+\s*хэсэг|iii+\s*хэсэг|part\s+[a-z0-9]+|section\s+[a-z0-9]+|эсээний\s*хэсэг|унших\s*хэсэг|бичих\s*хэсэг|сонсох\s*хэсэг|даалгавар\s*\d+[-–]\d+)/i.test(
    line.trim(),
  );
}

export function inferSectionType(
  line: string,
  subjectProfile: SubjectProfile,
): SectionType {
  const value = line.toLowerCase();
  if (isMetaLine(line)) return 'meta';
  if (/сонсох|listening/.test(value)) return 'listening';
  if (/унш|эхийг\s*унша|reading/.test(value)) return 'reading';
  if (
    /эсээ|эх\s*зохион\s*найруул|зохион\s*бич|write an essay|essay/.test(value)
  )
    return 'essay';
  if (/бичих|write|rewrite|найруул/.test(value)) return 'writing';
  if (/сонго|choose|select|multiple choice|тест/.test(value))
    return 'multiple_choice';
  if (/богино\s*хариул|fill in|define|тодорхойл|short answer/.test(value))
    return 'short_answer';
  if (/хүснэгт|график|зураг|figure|chart|periodic|период/.test(value))
    return 'table_context';
  if (subjectProfile === 'mongolian_language') return 'reading';
  return 'generic';
}

export function isEssayPrompt(line: string) {
  return /\b(эсээ\s*бич|эх\s*зохион\s*найруул|тайлбарла|харьцуул|дүгнэ|тодорхойл|шинжил|өөрийн\s*үзэл\s*бодол|сэдвээс\s*нэгийг\s*сонгон|explain|discuss|compare|analyze|justify|write)\b/i.test(
    line,
  );
}

export function isOpenQuestionPrompt(line: string) {
  return /\b(яагаад|хэрхэн|тайлбарла|тодорхойл|ол|бод|дүгнэ|харьцуул|тэнцүүл|тооцоол|хөрвүүл|rewrite|translate|define|calculate|balance)\b/i.test(
    line,
  );
}

export function isSharedContextLine(line: string) {
  return /(дараах\s+(эх|хүснэгт|график|зураг|схем|томьёо|өгөгдөл|case|text)|ашиглан|ажиглаад|уншаад|look at the table|use the figure|periodic table|периодын\s*хүснэгт)/i.test(
    line,
  );
}

export function looksLikeCalculationOrFormula(text: string) {
  return /(->|→|⇌|Δ|[A-Z][a-z]?\d?|H2O|NaCl|CO2|[=+\-*/()]|моль|масс|урвал|formula|equation|тэнцүүл|тооцоол)/i.test(
    text,
  );
}

export function findOptionSegments(line: string) {
  const matches = [...line.matchAll(/(?:^|\s)([A-H]|[А-Е])[).:]\s+/g)];
  if (matches.length < 2) return null;
  const segments: string[] = [];
  for (let i = 0; i < matches.length; i += 1) {
    const start = matches[i].index ?? 0;
    const end =
      i + 1 < matches.length
        ? (matches[i + 1].index ?? line.length)
        : line.length;
    segments.push(
      line
        .slice(start)
        .trim()
        .slice(0, end - start)
        .trim(),
    );
  }
  return segments.filter(Boolean);
}

export function isRealMultipleChoiceOptionLine(line: string) {
  return /^([A-H]|[А-Е])[).:]\s+\S+/i.test(line.trim());
}

export function isSubQuestionStart(line: string) {
  return /^(\d+(?:\.\d+)+)(?:[).:])?\s+\S/.test(line.trim());
}

export function isBlankLabelLine(line: string) {
  return /^[a-zа-яёөү][).:]\s*(?:_{1,}|\[\s*\]|$)/i.test(line.trim());
}

export function extractChoicePool(lines: string[]) {
  const joined = normalizeWhitespace(lines.join(' '));
  const match = joined.match(
    /\b(?:0|1|2|3|4|5|6|7|8|9)(?:\s*[,;.]?\s*(?:0|1|2|3|4|5|6|7|8|9))+\b/,
  );
  if (!match) return [];
  return match[0]
    .split(/[\s,;.]+/)
    .map((v) => v.trim())
    .filter(Boolean);
}

export function looksLikeLabelToDigitMapping(lines: string[]) {
  return (
    lines.filter(isBlankLabelLine).length >= 2 &&
    extractChoicePool(lines).length >= 3 &&
    lines.filter(isSubQuestionStart).length >= 1
  );
}

export function expandEssayTopicChoices(lines: string[]) {
  const intro = normalizeWhitespace(
    lines.filter((line) => !/^[A-ZА-ЯӨҮЁ0-9][).:]/.test(line.trim())).join(' '),
  );
  const topicLines = lines.filter((line) =>
    /^[A-ZА-ЯӨҮЁ0-9][).:]\s+/.test(line.trim()),
  );
  if (!intro || topicLines.length < 2) return null;
  return topicLines
    .map((line) => line.replace(/^[A-ZА-ЯӨҮЁ0-9][).:]\s+/, '').trim())
    .filter(Boolean)
    .map((topic) => normalizeWhitespace(`${intro} ${topic}`));
}

export function looksLikeBadQuestion(q: ImportedQuestionPayload) {
  const text = normalizeWhitespace(q.question ?? '');
  if (!text) return true;
  if (isPageChromeLine(text)) return true;
  if (/^(батлав|санамж|заавар|instructions?|хувилбар|variant)/i.test(text))
    return true;
  if (
    q.type === 'multiple_choice' &&
    (!Array.isArray(q.options) || q.options.length < 2)
  )
    return true;
  return false;
}

export function isLikelyHeading(
  question: string,
  contextLabels: string[],
  hasStructuredContent: boolean,
) {
  const normalizedQuestion = normalizeWhitespace(question).toLowerCase();
  if (!normalizedQuestion) return true;
  if (isPageChromeLine(question)) return true;
  if (
    contextLabels.some(
      (label) => label && normalizedQuestion === label.toLowerCase(),
    )
  )
    return true;
  if (
    /^(section|part|chapter|instructions?|answer key|variant|хэсэг|бүлэг|заавар|хувилбар)\b/i.test(
      question,
    )
  )
    return true;
  if (hasStructuredContent) return false;
  return (
    normalizedQuestion.length <= 120 &&
    !/[?？]|_{2,}|\.{3}|[:;]/.test(question) &&
    !/\b(choose|select|write|explain|solve|compare|define|answer|сонго|бич|тайлбар|бод|хариул)\b/i.test(
      question,
    )
  );
}
