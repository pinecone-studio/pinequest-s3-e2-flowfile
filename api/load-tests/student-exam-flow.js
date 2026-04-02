import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = (__ENV.BASE_URL || 'http://localhost:3001').replace(/\/+$/, '');
const EXAM_ID = __ENV.EXAM_ID || '';
const STUDENT_TOKEN = __ENV.STUDENT_TOKEN || '';
const STUDENT_TOKENS = (__ENV.STUDENT_TOKENS || '')
  .split(',')
  .map((token) => token.trim())
  .filter(Boolean);
const THINK_TIME_MS = Number(__ENV.THINK_TIME_MS || 300);
const AUTOSAVE_PER_VU = Math.max(1, Number(__ENV.AUTOSAVE_PER_VU || 3));

const tokenPool = STUDENT_TOKENS.length > 0 ? STUDENT_TOKENS : STUDENT_TOKEN ? [STUDENT_TOKEN] : [];

export const options = {
  scenarios: {
    student_exam_flow: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '15s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1500'],
  },
};

function failIfMissingConfig() {
  if (!tokenPool.length) {
    throw new Error(
      'Missing auth token. Set STUDENT_TOKEN or STUDENT_TOKENS before running k6.',
    );
  }
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function pickToken() {
  return tokenPool[(__VU - 1) % tokenPool.length];
}

function request(method, path, token, body) {
  return http.request(method, `${BASE_URL}${path}`, body, {
    headers: authHeaders(token),
    tags: { endpoint: path, method },
  });
}

function parseJson(response, label) {
  try {
    return response.json();
  } catch (_error) {
    throw new Error(`${label} did not return valid JSON. status=${response.status}`);
  }
}

function pickExamForStudent(token) {
  if (EXAM_ID) {
    return EXAM_ID;
  }

  const response = request('GET', '/exams/assigned/me', token);
  check(response, {
    'assigned exams request succeeded': (res) => res.status === 200,
  });

  const items = parseJson(response, 'assigned exams');
  const readyExam = items.find(
    (item) =>
      item?.attemptStatus === 'ready' || item?.attemptStatus === 'in_progress',
  );

  if (!readyExam?.exam?.id) {
    throw new Error(
      'No ready or in-progress exam found for this token. Set EXAM_ID or assign a test exam first.',
    );
  }

  return readyExam.exam.id;
}

function startSession(token, examId) {
  const response = request('POST', `/sessions/exam/${examId}/start`, token);
  check(response, {
    'session started': (res) => res.status === 201 || res.status === 200,
  });
  return parseJson(response, 'start session');
}

function fetchAttempt(token, sessionId) {
  const response = request('GET', `/sessions/${sessionId}/attempt`, token);
  check(response, {
    'attempt fetched': (res) => res.status === 200,
  });
  return parseJson(response, 'fetch attempt');
}

function autosaveAnswer(token, sessionId, questionId, value) {
  const payload = JSON.stringify({
    sessionId,
    questionId,
    textAnswer: value,
  });
  const response = request('POST', '/answers/autosave', token, payload);
  check(response, {
    'answer autosaved': (res) => res.status === 201 || res.status === 200,
  });
  return response;
}

function submitSession(token, sessionId) {
  const response = request('PATCH', `/sessions/${sessionId}/submit`, token);
  check(response, {
    'session submitted': (res) => res.status === 200,
  });
  return response;
}

export function setup() {
  failIfMissingConfig();

  if (tokenPool.length < options.scenarios.student_exam_flow.stages[1].target) {
    console.log(
      `Warning: only ${tokenPool.length} student token(s) provided. Reusing one student across many VUs can distort concurrency results.`,
    );
  }
}

export default function () {
  const token = pickToken();

  group('student exam flow', () => {
    const examId = pickExamForStudent(token);
    const session = startSession(token, examId);
    const attempt = fetchAttempt(token, session.id);
    const questions = Array.isArray(attempt.questions) ? attempt.questions : [];

    if (!questions.length) {
      throw new Error(`No questions returned for session ${session.id}.`);
    }

    const saveCount = Math.min(AUTOSAVE_PER_VU, questions.length);

    for (let index = 0; index < saveCount; index += 1) {
      const question = questions[index];
      autosaveAnswer(
        token,
        session.id,
        question.id,
        `k6 answer vu=${__VU} iter=${__ITER} q=${index + 1}`,
      );
      sleep(THINK_TIME_MS / 1000);
    }

    submitSession(token, session.id);
  });
}
