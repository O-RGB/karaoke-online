import { NextResponse } from "next/server";

const BACKEND_URL = "http://119.59.103.56:5000";

export async function GET(request: Request) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "Backend API URL is not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 }
    );
  }
  if (query.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters long." },
      { status: 200 }
    );
  }

  try {
    const apiResponse = await fetch(`${BACKEND_URL}/search?q=${query}`, {
      cache: "no-store",
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      throw new Error(
        `Backend API error: ${apiResponse.status} ${apiResponse.statusText} - ${errorBody}`
      );
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API_SEARCH_ERROR]", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to fetch from backend API", details: errorMessage },
      { status: 502 }
    );
  }
}
