import { NextResponse } from "next/server";

const BACKEND_URL_SONG = "http://119.59.103.56:5000";

export async function GET(request: Request) {
  if (!BACKEND_URL_SONG) {
    return NextResponse.json(
      { error: "Backend API URL is not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const superIndex = searchParams.get("superIndex");
  const originalIndex = searchParams.get("originalIndex");

  if (superIndex === null || originalIndex === null) {
    return NextResponse.json(
      { error: "superIndex and originalIndex are required" },
      { status: 400 }
    );
  }

  try {
    const apiUrl = `${BACKEND_URL_SONG}/get_song?superIndex=${superIndex}&originalIndex=${originalIndex}`;
    const apiResponse = await fetch(apiUrl, {
      cache: "no-store",
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      throw new Error(
        `Backend API error: ${apiResponse.status} ${apiResponse.statusText} - ${errorBody}`
      );
    }

    const songBlob = await apiResponse.blob();
    const headers = new Headers();
    headers.set(
      "Content-Type",
      apiResponse.headers.get("Content-Type") || "application/octet-stream"
    );

    return new Response(songBlob, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error("[API_GET_SONG_ERROR]", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to fetch song from backend API", details: errorMessage },
      { status: 502 }
    );
  }
}
