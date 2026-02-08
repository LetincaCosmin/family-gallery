import { NextResponse } from "next/server";

export async function POST(req) {
  const { password } = await req.json();
  const ok = password && password === process.env.FAMILY_PASSWORD;
  return NextResponse.json({ ok });
}
