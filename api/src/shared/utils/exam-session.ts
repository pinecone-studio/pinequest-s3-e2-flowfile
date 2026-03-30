import type { Answer } from 'src/shared/types/answer.types';
import type { Exam } from 'src/shared/types/exam.types';
import type { Session, SessionTiming } from 'src/shared/types/session.types';

function toValidDate(input?: string | null) {
  if (!input) {
    return null;
  }

  const date = new Date(input);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function getSessionExpiryDate(
  exam: Pick<Exam, 'durationMinutes' | 'endsAt'>,
  session: Pick<Session, 'startedAt'>,
) {
  const startedAt = toValidDate(session.startedAt);

  if (!startedAt) {
    return null;
  }

  const durationDeadline = new Date(
    startedAt.getTime() + exam.durationMinutes * 60 * 1000,
  );
  const examEnd = toValidDate(exam.endsAt);

  if (!examEnd) {
    return durationDeadline;
  }

  return durationDeadline < examEnd ? durationDeadline : examEnd;
}

export function getSessionTiming(
  exam: Pick<Exam, 'durationMinutes' | 'endsAt'>,
  session: Pick<Session, 'startedAt'>,
  now = new Date(),
): SessionTiming {
  const startedAt = session.startedAt ?? null;
  const expiryDate = getSessionExpiryDate(exam, session);
  const expiresAt = expiryDate?.toISOString() ?? null;
  const timeRemainingMs = expiryDate
    ? Math.max(0, expiryDate.getTime() - now.getTime())
    : 0;

  return {
    serverTime: now.toISOString(),
    startedAt,
    expiresAt,
    timeLimitMinutes: exam.durationMinutes,
    timeRemainingSeconds: Math.ceil(timeRemainingMs / 1000),
    isExpired: expiryDate ? expiryDate.getTime() <= now.getTime() : false,
  };
}

export function isAnswerProvided(
  answer?: Pick<Answer, 'textAnswer' | 'formulaAnswerJson' | 'fileUrl'> | null,
) {
  if (!answer) {
    return false;
  }

  return [answer.textAnswer, answer.formulaAnswerJson, answer.fileUrl].some(
    (value) => typeof value === 'string' && value.trim().length > 0,
  );
}
