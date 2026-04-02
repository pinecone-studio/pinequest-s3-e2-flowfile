import {
  CURRENT_STUDENT_ID,
  CURRENT_TEACHER_ID,
  getCurrentStudent,
  getCurrentTeacher,
} from "@/lib/data";

type DevRole = "student" | "teacher";

export function getApiUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!baseUrl) {
    return "";
  }

  return `${baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function isApiConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_API_BASE_URL?.trim());
}

function createDevTokenPayload(role: DevRole) {
  const user = role === "teacher" ? getCurrentTeacher() : getCurrentStudent();

  const userId = role === "teacher" ? CURRENT_TEACHER_ID : CURRENT_STUDENT_ID;
  const emailPrefix = role === "teacher" ? "teacher" : "student";

  return {
    userId,
    email: `${emailPrefix}.${userId.toLowerCase()}@seedcone.local`,
    role,
    name: user?.name ?? userId,
  };
}

export function getDevAuthToken(role: DevRole = "student") {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem("seedcone.dev_auth_token");
  if (existing) {
    return existing;
  }

  const token = btoa(JSON.stringify(createDevTokenPayload(role)));
  window.localStorage.setItem("seedcone.dev_auth_token", token);
  return token;
}

export function getAuthHeaders(role: DevRole = "student") {
  const token = getDevAuthToken(role);

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  role: DevRole = "student",
) {
  const url = getApiUrl(path);

  if (!url) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...getAuthHeaders(role),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}
