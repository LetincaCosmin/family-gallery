"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { cldThumb } from "@/lib/cloudinary";

export default function AlbumPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openIndex, setOpenIndex] = useState(-1);

  // swipe
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  useEffect(() => {
    const ok = localStorage.getItem("family_authed") === "1";
    if (!ok) router.replace("/login");
  }, [router]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch("/api/albums", { cache: "no-store" });
        const json = await res.json();
        const found = (json.albums || []).find((a) => a.slug === slug);
        if (alive) setAlbum(found || null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (slug) load();
    return () => {
      alive = false;
    };
  }, [slug]);

  const photos = useMemo(() => album?.photos || [], [album]);
  const opened = openIndex >= 0 ? photos[openIndex] : null;

  function close() {
    setOpenIndex(-1);
  }
  function prev() {
    setOpenIndex((i) => Math.max(0, i - 1));
  }
  function next() {
    setOpenIndex((i) => Math.min(photos.length - 1, i + 1));
  }

  // keyboard controls
  useEffect(() => {
    function onKey(e) {
      if (openIndex < 0) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, photos.length]);

  function onTouchStart(e) {
    if (!opened) return;
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  }

  function onTouchEnd(e) {
    if (!opened) return;
    const startX = touchStartX.current;
    const startY = touchStartY.current;
    if (startX == null || startY == null) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    // ignore vertical swipes/scroll
    if (Math.abs(dy) > Math.abs(dx)) return;

    const threshold = 40; // px
    if (dx > threshold) prev();
    if (dx < -threshold) next();
  }

  if (loading) {
    return (
      <main className="min-h-dvh bg-transparent text-white flex items-center justify-center">
        Se încarcă...
      </main>
    );
  }

  if (!album) {
    return (
      <main className="min-h-dvh bg-transparent text-white flex items-center justify-center">
        Album inexistent.
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-transparent text-white p-6">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <header className="flex items-center justify-between gap-3">
          <button
            className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 hover:bg-white/15 transition"
            onClick={() => router.push("/")}
          >
            ← Înapoi
          </button>

          <div className="text-right">
            <h1 className="text-xl sm:text-2xl font-semibold">{album.title}</h1>
            {album.date ? (
              <p className="text-white/60 text-sm mt-1">{album.date}</p>
            ) : null}
          </div>
        </header>

        <section className="mt-6">
          {photos.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <p className="text-white/80">
                Album gol. Încarcă poze din Admin.
              </p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.03 } },
              }}
            >
              {photos.map((p, idx) => (
                <motion.button
                  key={p.public_id || p.url || idx}
                  onClick={() => setOpenIndex(idx)}
                  className="rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition"
                  initial={{ opacity: 0, scale: 0.98, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cldThumb(p.url, 480)}
                    alt=""
                    className="w-full aspect-square object-cover"
                    loading="lazy"
                  />
                </motion.button>
              ))}
            </motion.div>
          )}
        </section>

        {/* LIGHTBOX */}
        {opened ? (
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={close}
          >
            <div
              className="w-full max-w-6xl"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-2 sm:p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={opened.url}
                  alt=""
                  className="w-full max-h-[78vh] object-contain rounded-xl"
                />

                <div className="flex items-center justify-between gap-2 mt-3">
                  <button
                    className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 hover:bg-white/15 transition disabled:opacity-50"
                    onClick={prev}
                    disabled={openIndex === 0}
                  >
                    ←
                  </button>

                  <div className="text-sm text-white/70">
                    {openIndex + 1} / {photos.length}
                  </div>

                  <button
                    className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 hover:bg-white/15 transition disabled:opacity-50"
                    onClick={next}
                    disabled={openIndex === photos.length - 1}
                  >
                    →
                  </button>

                  <button
                    className="rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition px-4 py-2 font-medium"
                    onClick={close}
                  >
                    Închide
                  </button>
                </div>

                <p className="text-xs text-white/50 mt-2">
                  Tip: Esc închide, ←/→ navighează, pe mobil swipe
                  stânga/dreapta.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </motion.div>
    </main>
  );
}
