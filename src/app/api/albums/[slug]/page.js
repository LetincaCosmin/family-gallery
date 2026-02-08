"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AlbumPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [data, setData] = useState({ albums: [] });
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(-1);

  useEffect(() => {
    const ok = localStorage.getItem("family_authed") === "1";
    if (!ok) router.replace("/login");
  }, [router]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/albums", { cache: "no-store" });
        const json = await res.json();
        if (alive) setData(json);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, []);

  const album = useMemo(
    () => (data.albums || []).find((a) => a.slug === slug),
    [data, slug],
  );

  const photos = album?.photos || [];
  const opened = openIndex >= 0 ? photos[openIndex] : null;

  return (
    <main className="min-h-dvh bg-gradient-to-b from-[#071225] via-[#081a2f] to-[#050b16] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between gap-3">
          <button
            className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 hover:bg-white/15 transition"
            onClick={() => router.push("/")}
          >
            ← Înapoi
          </button>
          <div className="text-right">
            <h1 className="text-xl font-semibold">{album?.title || "Album"}</h1>
            {album?.date ? (
              <p className="text-white/60 text-sm">{album.date}</p>
            ) : null}
          </div>
        </header>

        <section className="mt-6">
          {loading ? (
            <p className="text-white/70">Se încarcă...</p>
          ) : !album ? (
            <p className="text-white/70">Album inexistent.</p>
          ) : photos.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <p className="text-white/80">
                Album gol. Încarcă poze din Admin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((p, idx) => (
                <button
                  key={p.public_id || p.url}
                  onClick={() => setOpenIndex(idx)}
                  className="rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt=""
                    className="w-full h-full object-cover aspect-square"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {opened ? (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setOpenIndex(-1)}
          >
            <div
              className="max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={opened.url}
                alt=""
                className="w-full max-h-[85vh] object-contain rounded-2xl border border-white/10"
              />
              <div className="flex justify-between mt-3">
                <button
                  className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 hover:bg-white/15 transition"
                  onClick={() => setOpenIndex((i) => Math.max(0, i - 1))}
                >
                  ←
                </button>
                <button
                  className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 hover:bg-white/15 transition"
                  onClick={() => setOpenIndex(-1)}
                >
                  Închide
                </button>
                <button
                  className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 hover:bg-white/15 transition"
                  onClick={() =>
                    setOpenIndex((i) => Math.min(photos.length - 1, i + 1))
                  }
                >
                  →
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
