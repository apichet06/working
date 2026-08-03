import { API_BASE_URL_USER, API_BASE_URL_WR } from './env'

type ApiFetchOptions = RequestInit & {
  skipAuthRedirect?: boolean;
};

function createApiFetch(baseUrl: string | undefined) {
  return async function apiFetch<T>(
    path: string,
    options: ApiFetchOptions = {}
  ): Promise<T> {
    const url = `${baseUrl}${path}`;
    const isFormData = options.body instanceof FormData;

    const headers = new Headers(options.headers || {});
    if (!isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await fetch(url, { ...options, headers, cache: "no-store" });

    if (res.status === 401) {
      //caller บอกว่าไม่ต้องลากไป logout
      if (options.skipAuthRedirect) {
        throw new Error("Unauthorized");
      }

      //ไม่มี token = ไม่ใช่ session หมด อย่าเด้ง
      if (!token) {
        throw new Error("Unauthorized");
      }

      //มี token แล้วโดน 401 = หมดอายุจริง ค่อย logout
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.replace("/");
      }
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
  };
}

// ระบบหลัก (WR)
export const apiFetchWR = createApiFetch(API_BASE_URL_WR);

// login / อ้างสิทธิ์ (USER)
export const apiFetchUser = createApiFetch(API_BASE_URL_USER);
