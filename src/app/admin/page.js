"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CloudinaryUploader from "@/components/CloudinaryUploader";
import { slugify } from "@/lib/slugify";

function prettyDate(d) {
  if (!d) return "";
  // d expected YYYY-MM-DD
  return d;
}

export default function AdminPage() {
  const router = useRouter();

  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(false);

  const [albumsJson, setAlbumsJson] = useState({ albums: [] });
  const [loadingAlbums, setLoadingAlbums] = useState(true);

  const [selectedSlug, setSelectedSlug] = useState("");

  // create album form
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // --- auth guards ---
  useEffect(() => {
    const familyOk = localStorage.getItem("family_authed") === "1";
    if (!familyOk) router.replace("/login");

    const adminOk = localStorage.getItem("admin_authed") === "1";
    if (adminOk) setAuthed(true);
  }, [router]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoadingAuth(true);

    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!data.ok) {
        setErr("Parolă admin greșită.");
        return;
      }

      localStorage.setItem("admin_authed", "1");
      setAuthed(true);
    } catch {
      setErr("Eroare. Încearcă din nou.");
    } finally {
      setLoadingAuth(false);
    }
  }

  // --- load albums.json from GitHub via /api/albums ---
  useEffect(() => {
    if (!authed) return;

    let alive = true;
    (async () => {
      setLoadingAlbums(true);
      try {
        const res = await fetch("/api/albums", { cache: "no-store" });
        const json = await res.json();
        if (!alive) return;
        setAlbumsJson(json?.albums ? json : { albums: [] });

        // pick first album by default
        const first = (json?.albums || [])[0];
        setSelectedSlug((s) => s || first?.slug || "");
      } finally {
        if (alive) setLoadingAlbums(false);
      }
    })();

    return () => (alive = false);
  }, [authed]);

  const albums = useMemo(() => albumsJson.albums || [], [albumsJson]);

  const selectedAlbum = useMemo(
    () => albums.find((a) => a.slug === selectedSlug),
    [albums, selectedSlug],
  );

  function createAlbum() {
    setSaveMsg("");
    const title = newTitle.trim();
    if (!title) {
      setSaveMsg("Titlul albumului e obligatoriu.");
      return;
    }

    const slug = slugify(title);
    if (!slug) {
      setSaveMsg("Nu pot genera slug din titlu.");
      return;
    }

    if (albums.some((a) => a.slug === slug)) {
      setSaveMsg(
        "Există deja un album cu același titlu (slug). Schimbă titlul.",
      );
      return;
    }

    const album = {
      slug,
      title,
      date: newDate ? prettyDate(newDate) : "",
      description: newDesc.trim(),
      coverUrl: "",
      photos: [],
      createdAt: new Date().toISOString(),
    };

    const next = { albums: [album, ...albums] };
    setAlbumsJson(next);
    setSelectedSlug(slug);
    setNewTitle("");
    setNewDate("");
    setNewDesc("");
    setSaveMsg("Album creat local. Apasă Save ca să îl scrii în GitHub.");
  }

  function setCoverFromFirstIfMissing(nextAlbums) {
    return nextAlbums.map((a) => {
      if (!a.coverUrl && a.photos?.length) {
        return { ...a, coverUrl: a.photos[0].url };
      }
      return a;
    });
  }

  function addUploadedToSelected(uploadedItems) {
    setSaveMsg("");
    if (!selectedAlbum) {
      setSaveMsg("Selectează sau creează un album înainte să urci poze.");
      return;
    }

    const nextAlbums = albums.map((a) => {
      if (a.slug !== selectedAlbum.slug) return a;

      const existing = new Set(
        (a.photos || []).map((p) => p.public_id || p.url),
      );
      const added = uploadedItems
        .filter((x) => !existing.has(x.public_id || x.url))
        .map((x) => ({
          url: x.url,
          public_id: x.public_id,
          width: x.width,
          height: x.height,
          created_at: x.created_at,
          note: "",
        }));

      const photos = [...(a.photos || []), ...added];
      const coverUrl = a.coverUrl || photos[0]?.url || "";

      return { ...a, photos, coverUrl };
    });

    setAlbumsJson({ albums: setCoverFromFirstIfMissing(nextAlbums) });
    setSaveMsg(
      `Adăugate: ${uploadedItems.length} poze. Apasă Save ca să le scrii în GitHub.`,
    );
  }

  function removePhoto(idx) {
    if (!selectedAlbum) return;
    const nextAlbums = albums.map((a) => {
      if (a.slug !== selectedAlbum.slug) return a;
      const photos = [...(a.photos || [])];
      photos.splice(idx, 1);
      const coverUrl = photos[0]?.url || "";
      return { ...a, photos, coverUrl };
    });
    setAlbumsJson({ albums: nextAlbums });
  }

  async function saveToGitHub() {
    setSaveMsg("");
    setSaving(true);
    try {
      const res = await fetch("/api/albums/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumsJson,
          message: "Update family albums",
        }),
      });
      const out = await res.json();
      if (!out.ok) throw new Error(out.error || "Save failed");
      setSaveMsg(
        `Salvat în GitHub ✅ commit: ${String(out.commit || "").slice(0, 7)}`,
      );
    } catch (e) {
      setSaveMsg(`Eroare la save: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (!authed) {
    return (
      <div className="min-h-dvh bg-transparent text-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl">
          <h1 className="text-2xl font-semibold">Admin</h1>
          <p className="text-slate-700 mt-2">Introdu parola de admin.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parola admin"
              className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-300/40"
            />
            {err ? <p className="text-sm text-red-300">{err}</p> : null}

            <button
              disabled={loadingAuth}
              className="w-full rounded-xl bg-cyan-300/20 border border-cyan-200/20 hover:bg-cyan-300/30 transition px-4 py-3 font-medium"
            >
              {loadingAuth ? "Verific..." : "Intră în Admin"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-dvh bg-transparent text-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Admin Panel</h1>
            <p className="text-slate-500 text-sm mt-1">Albume / Evenimente</p>
          </div>

          <div className="flex gap-2">
            <button
              className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 hover:bg-white/15 transition"
              onClick={() => router.push("/")}
            >
              Înapoi
            </button>
            <button
              className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 hover:bg-white/15 transition"
              onClick={() => {
                localStorage.removeItem("admin_authed");
                setAuthed(false);
              }}
            >
              Logout admin
            </button>
          </div>
        </header>

        {/* Top controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">Selectează album</h2>

              <button
                disabled={saving}
                onClick={saveToGitHub}
                className="rounded-xl bg-cyan-300/20 border border-cyan-200/20 hover:bg-cyan-300/30 transition px-4 py-2 font-medium disabled:opacity-60"
              >
                {saving ? "Salvez..." : "Save to GitHub"}
              </button>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2 outline-none"
              >
                <option value="">— alege —</option>
                {albums.map((a) => (
                  <option key={a.slug} value={a.slug}>
                    {a.title}
                    {a.date ? ` (${a.date})` : ""}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setSelectedSlug("");
                  setSaveMsg("Creează un album nou mai jos.");
                }}
                className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 hover:bg-white/15 transition"
              >
                + Album nou
              </button>
            </div>

            {loadingAlbums ? (
              <p className="text-slate-500 mt-3">Încarc albumele...</p>
            ) : null}

            {saveMsg ? (
              <p
                className={`text-sm mt-3 ${saveMsg.startsWith("Eroare") ? "text-red-300" : "text-slate-500"}`}
              >
                {saveMsg}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <h2 className="font-semibold">Creează album</h2>

            <div className="mt-4 space-y-3">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Titlu (ex: Crăciun 2025)"
                className="w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2 outline-none"
              />
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2 outline-none"
              />
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Descriere (opțional)"
                className="w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2 outline-none min-h-[90px]"
              />

              <button
                onClick={createAlbum}
                className="w-full rounded-xl bg-cyan-300/20 border border-cyan-200/20 hover:bg-cyan-300/30 transition px-4 py-2 font-medium"
              >
                Creează local
              </button>

              <p className="text-xs text-slate-500">
                Albumul apare imediat, dar devine „real” după{" "}
                <span className="font-mono">Save to GitHub</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Upload */}
        <CloudinaryUploader onUploaded={addUploadedToSelected} />

        {/* Selected album info + photos */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">
                {selectedAlbum ? selectedAlbum.title : "Niciun album selectat"}
              </h2>
              {selectedAlbum?.date ? (
                <p className="text-sm text-slate-500 mt-1">
                  {selectedAlbum.date}
                </p>
              ) : null}
              {selectedAlbum?.description ? (
                <p className="text-sm text-slate-500 mt-2">
                  {selectedAlbum.description}
                </p>
              ) : null}
            </div>

            {selectedAlbum ? (
              <span className="text-xs text-slate-500">
                {selectedAlbum.photos?.length || 0} poze
              </span>
            ) : null}
          </div>

          {!selectedAlbum ? (
            <p className="text-slate-500 mt-4">
              Creează sau selectează un album ca să poți adăuga poze.
            </p>
          ) : selectedAlbum.photos?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-5">
              {selectedAlbum.photos.map((p, idx) => (
                <div
                  key={p.public_id || p.url}
                  className="rounded-xl overflow-hidden border border-white/10 bg-white/5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt=""
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-2 flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 truncate">
                      {p.public_id || "photo"}
                    </span>
                    <button
                      onClick={() => removePhoto(idx)}
                      className="text-xs rounded-lg bg-white/10 border border-white/10 px-2 py-1 hover:bg-white/15 transition"
                      title="Șterge"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 mt-4">Album gol. Urcă poze mai sus.</p>
          )}
        </div>
      </div>
    </main>
  );
}

