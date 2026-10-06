const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("route53_token") : null;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("route53_token");
      localStorage.removeItem("route53_username");
      window.location.href = "/login";
    }

    const errorData = await res.json().catch(() => ({ detail: "An error occurred" }));
    throw new Error(errorData.detail || `HTTP Error ${res.status}`);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}