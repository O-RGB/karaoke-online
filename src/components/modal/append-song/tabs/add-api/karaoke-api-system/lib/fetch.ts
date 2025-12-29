export interface FetchAPIOptions<T = any> {
  method?: "GET" | "POST" | "PUT" | "DELETE" | string;
  headers?: Record<string, string>;
  body?: T;
  responseType?: "json" | "blob";
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
  const {
    method = "GET",
    headers = {},
    body,
    responseType = "json",
  } = options || {};

  let fetchBody: any;
  const fetchHeaders: Record<string, string> = { ...headers };

  // ---------- prepare body ----------
  if (body !== undefined && body !== null) {
    const contentType = headers?.["Content-Type"] || "";

    if (contentType.includes("application/json")) {
      fetchBody = body;
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      if (body instanceof URLSearchParams) {
        fetchBody = body.toString();
      } else if (typeof body === "object") {
        const params = new URLSearchParams();
        for (const key in body as any) {
          params.append(key, String((body as any)[key]));
        }
        fetchBody = params.toString();
      } else {
        fetchBody = body;
      }
    } else if (body instanceof FormData) {
      fetchBody = body;
      // browser จะ set boundary ให้เอง
      delete fetchHeaders["Content-Type"];
    } else {
      fetchBody = body;
    }
  }

  // ---------- call proxy ----------
  const response = await fetch("/api/proxy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      endpoint,
      method,
      headers: fetchHeaders,
      body: fetchBody,
    }),
  });

  // ---------- handle no content ----------
  if (response.status === 204) {
    return {} as R;
  }

  // ---------- error handling ----------
  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
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

    throw {
      status: response.status,
      message,
      body: errorBody,
    } as FetchAPIError;
  }

  // ---------- blob response ----------
  if (responseType === "blob") {
    return (await response.blob()) as unknown as R;
  }

  // ---------- json response ----------
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as R;
  }

  // fallback (rare case)
  return (await response.text()) as unknown as R;
}
