import { NextResponse } from "next/server";

export async function GET() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  const path = process.env.GITHUB_DATA_PATH || "data/albums.json";

  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  const res = await fetch(rawUrl, { cache: "no-store" });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Nu pot citi albums.json din GitHub", status: res.status },
      { status: 500 },
    );
  }

  const json = await res.json();
  return NextResponse.json(json);
}
