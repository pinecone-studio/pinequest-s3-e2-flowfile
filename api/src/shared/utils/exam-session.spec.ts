import { getSessionTiming, isAnswerProvided } from './exam-session';

describe('exam-session utils', () => {
  it('uses the earlier of duration limit and exam end time', () => {
    const exam = {
      durationMinutes: 60,
      endsAt: '2026-03-30T10:30:00.000Z',
    };
    const session = {
      startedAt: '2026-03-30T10:00:00.000Z',
    };
    const now = new Date('2026-03-30T10:10:00.000Z');

    const timing = getSessionTiming(exam, session, now);

    expect(timing.expiresAt).toBe('2026-03-30T10:30:00.000Z');
    expect(timing.timeRemainingSeconds).toBe(20 * 60);
    expect(timing.isExpired).toBe(false);
  });

  it('marks the session expired when the duration is exhausted', () => {
    const exam = {
      durationMinutes: 30,
      endsAt: null,
    };
    const session = {
      startedAt: '2026-03-30T10:00:00.000Z',
    };
    const now = new Date('2026-03-30T10:31:00.000Z');

    const timing = getSessionTiming(exam, session, now);

    expect(timing.expiresAt).toBe('2026-03-30T10:30:00.000Z');
    expect(timing.timeRemainingSeconds).toBe(0);
    expect(timing.isExpired).toBe(true);
  });

  it('treats blank answers as unanswered', () => {
    expect(
      isAnswerProvided({
        textAnswer: '   ',
        formulaAnswerJson: null,
        fileUrl: null,
      }),
    ).toBe(false);

    expect(
      isAnswerProvided({
        textAnswer: null,
        formulaAnswerJson: null,
        fileUrl: 'https://example.com/file.png',
      }),
    ).toBe(true);
  });
});
