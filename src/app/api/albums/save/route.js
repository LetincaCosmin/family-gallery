import { NextResponse } from "next/server";

async function gh(url, options = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("Lipsește GITHUB_TOKEN în .env.local");

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || `GitHub error ${res.status}`);
  }
  return data;
}

export async function POST(req) {
  try {
    console.log("TOKEN START:", process.env.GITHUB_TOKEN?.slice(0, 6));
    console.log("OWNER:", process.env.GITHUB_OWNER);
    console.log("REPO:", process.env.GITHUB_REPO);
    const body = await req.json(); // { albumsJson, message }
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";
    const path = process.env.GITHUB_DATA_PATH || "data/albums.json";

    const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    // 1) ia SHA-ul fișierului curent
    const current = await gh(`${apiBase}?ref=${branch}`);

    // 2) pregătește conținutul nou (base64)
    const content = Buffer.from(
      JSON.stringify(body.albumsJson, null, 2),
      "utf8",
    ).toString("base64");

    // 3) update (commit)
    const updated = await gh(apiBase, {
      method: "PUT",
      body: JSON.stringify({
        message: body.message || "Update albums.json",
        content,
        sha: current.sha,
        branch,
      }),
    });

    return NextResponse.json({ ok: true, commit: updated?.commit?.sha });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
