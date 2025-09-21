export interface FetchAPIOptions<T = any> {
  method?: "GET" | "POST" | "PUT" | "DELETE" | string;
  headers?: Record<string, string>;
  body?: T;
}

export interface FetchAPIError {
  status: number;
  message: string;
  body?: any;
}

export async function fetchAPI<TBody = any, R = any>(
  endpoint: string,
  options?: FetchAPIOptions<TBody>
): Promise<R> {
  const { method = "GET", headers = {}, body } = options || {};

  let fetchBody: any;
  const fetchHeaders: Record<string, string> = { ...headers };
  if (body) {
    const contentType = headers?.["Content-Type"] || "";
    if (contentType.includes("application/json")) {
      fetchBody = body;
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      if (body instanceof URLSearchParams) {
        fetchBody = body.toString();
      } else if (typeof body === "object") {
        const params = new URLSearchParams();
        for (const key in body) {
          params.append(key, (body as any)[key]);
        }
        fetchBody = params.toString();
      } else {
        fetchBody = body;
      }
    } else if (body instanceof FormData) {
      fetchBody = body;
      delete fetchHeaders["Content-Type"];
    } else {
      fetchBody = body;
    }
  }
  const response = await fetch("/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint,
      method,
      headers: fetchHeaders,
      body: fetchBody,
    }),
  });

  const contentType = response.headers.get("content-type") || "";

  if (response.status === 204) {
    return {} as R;
  }

  if (!response.ok) {
    let errorBody: any;
    try {
      errorBody = contentType.includes("application/json")
        ? await response.json()
        : await response.text();
    } catch {
      errorBody = await response.text();
    }

    let message = "Fetch failed";
    if (typeof errorBody === "string") {
      message = errorBody;
    } else if (errorBody?.error?.detail) {
      message = errorBody.error.detail;
    } else if (errorBody?.detail) {
      message = Array.isArray(errorBody.detail)
        ? errorBody.detail.map((d: any) => d.msg || d).join(", ")
        : errorBody.detail;
    }

    const error: FetchAPIError = {
      status: response.status,
      message,
      body: errorBody,
    };
    throw error;
  }

  if (contentType.includes("application/json")) {
    const data: R = await response.json();
    return data;
  }

  const blob = await response.blob();
  return blob as unknown as R;
}
