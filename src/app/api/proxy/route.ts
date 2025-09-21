import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      endpoint,
      method = "GET",
      headers = {},
      body,
    } = await request.json();

    const fetchHeaders: Record<string, string> = { ...headers };
    let fetchBody: any;

    if (body) {
      const contentType = headers?.["Content-Type"] || "";

      if (contentType.includes("application/json")) {
        fetchBody = JSON.stringify(body);
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
        delete headers["Content-Type"];
      } else {
        fetchBody = body;
      }
    }

    const apiResponse = await fetch(endpoint, {
      method,
      headers,
      body: fetchBody,
    });

    const responseContentType = apiResponse.headers.get("content-type") || "";

    if (apiResponse.status === 204) {
      return NextResponse.json({}, { status: 200 });
    }

    if (!apiResponse.ok) {
      const errorBody = responseContentType.includes("application/json")
        ? await apiResponse.json()
        : await apiResponse.text();
      return NextResponse.json(
        { error: errorBody },
        { status: apiResponse.status }
      );
    }

    if (responseContentType.includes("application/json")) {
      const data = await apiResponse.json();
      return NextResponse.json(data);
    }

    const blob = await apiResponse.arrayBuffer();
    return new Response(blob, {
      status: 200,
      headers: { "Content-Type": responseContentType },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
