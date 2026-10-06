const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "An error occurred" }));
    throw new Error(errorData.detail || `HTTP Error ${res.status}`);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}