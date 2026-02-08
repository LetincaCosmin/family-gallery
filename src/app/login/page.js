"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!data.ok) {
        setErr("Parolă greșită.");
        return;
      }

      localStorage.setItem("family_authed", "1");
      router.replace("/");
    } catch {
      setErr("Eroare. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-transparent text-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl"
      >
        <h1 className="text-2xl font-semibold">Galeria familiei</h1>
        <p className="text-slate-700 mt-2">
          Introdu parola ca să vezi albumele.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parola familiei"
            className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-300/40"
          />

          {err ? <p className="text-sm text-red-300">{err}</p> : null}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-cyan-300/20 border border-cyan-200/20 hover:bg-cyan-300/30 transition px-4 py-3 font-medium"
          >
            {loading ? "Verific..." : "Intră"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

