import { headers } from "next/headers";

export function getBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  const h = headers();
  const host = h.get("host") || "localhost:3000";
  const isDev = process.env.NODE_ENV !== "production";
  const protocol = isDev ? "http" : "https";

  return `${protocol}://${host}`;
}

export function serverFetch(
  input: string,
  init?: RequestInit
): Promise<Response> {
  // إذا كان URL كامل، نستخدمه كما هو
  if (/^https?:\/\//i.test(input)) {
    return fetch(input, init);
  }

  const baseUrl = getBaseUrl();

  const path = input.startsWith("/")
    ? input
    : `/${input.replace(/^\/+/, "")}`;

  const url = `${baseUrl}${path}`;
  return fetch(url, init);
}

