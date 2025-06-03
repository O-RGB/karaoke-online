// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '';

  const res = await fetch(`http://119.59.103.56:5000/search?query=${query}`);
  const data = await res.json();

  return NextResponse.json(data);
}
