"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

function AlbumCard({ album, onOpen }) {
  return (
    <motion.button
      layoutId={`album-${album.slug}`}
      onClick={() => onOpen(album)}
      className="card-3d glass glass-hover text-left rounded-2xl overflow-hidden transition"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="aspect-[16/10] bg-white/5">
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            Fără cover
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">{album.title}</h3>
            {album.date ? (
              <p className="text-sm text-slate-500 mt-1">{album.date}</p>
            ) : null}
          </div>
          <span className="text-xs text-slate-500">
            {album.photos?.length || 0} poze
          </span>
        </div>
      </div>
    </motion.button>
  );
}
export default function HomePage() {
  const router = useRouter();
  const [data, setData] = useState({ albums: [] });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
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

  useEffect(() => {
    if (!selected) return;

    // după 450ms intră în pagina albumului
    const t = setTimeout(() => {
      router.push(`/album/${selected.slug}`);
    }, 500);

    return () => clearTimeout(t);
  }, [selected, router]);

  const albums = useMemo(() => data.albums || [], [data]);

  return (
    <main className="min-h-dvh bg-transparent text-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">LET-Digital Gallery</h1>
            <p className="text-slate-500 text-sm mt-1">Albume & evenimente</p>
          </div>

          <div className="flex gap-2">
            <button
              className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 hover:bg-white/15 transition"
              onClick={() => router.push("/admin")}
            >
              Admin
            </button>
            <button
              className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 hover:bg-white/15 transition"
              onClick={() => {
                localStorage.removeItem("family_authed");
                localStorage.removeItem("admin_authed");
                router.replace("/login");
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <section className="mt-8">
          {loading ? (
            <p className="text-white/70">Se încarcă...</p>
          ) : albums.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <p className="text-white/80">
                Nu ai albume încă. Intră în{" "}
                <span className="font-mono">/admin</span> și creează primul
                album.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {albums.map((a) => (
                <AlbumCard
                  key={a.slug}
                  album={a}
                  onOpen={(album) => setSelected(album)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
      <AnimatePresence>
        {selected ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            {/* dim background */}
            <motion.div
              className="absolute inset-0 bg-black/45 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* expanding card */}
            <motion.div
              layoutId={`album-${selected.slug}`}
              className="relative w-full max-w-3xl rounded-3xl overflow-hidden border border-white/10 bg-white/10 backdrop-blur-2xl"
              onClick={(e) => e.stopPropagation()}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <div className="aspect-[16/9] bg-white/5">
                {selected.coverUrl ? (
                  <img
                    src={selected.coverUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    Fără cover
                  </div>
                )}
              </div>

              <div className="p-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold">
                    {selected.title}
                  </h2>
                  {selected.date ? (
                    <p className="text-slate-500 mt-1">{selected.date}</p>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
