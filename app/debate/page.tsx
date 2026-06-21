"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";
import "@mysten/dapp-kit/dist/index.css";
import dynamic from "next/dynamic";
import { DebateArena } from "@/components/DebateArena";
import { DebateTranscript, UserProfile } from "@/types";
import Link from "next/link";

const Ferrofluid = dynamic(() => import("@/components/Ferrofluid"), { ssr: false });

export default function Debate() {
  const router = useRouter();
  const account = useCurrentAccount();
  const [transcript, setTranscript] = useState<DebateTranscript | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const profile = localStorage.getItem("kissin_profile");
    if (!profile) { router.push("/onboarding"); return; }
    const address = account?.address || localStorage.getItem("kissin_address");
    if (!address) { router.push("/"); return; }
    if (account?.address) localStorage.setItem("kissin_address", account.address);
    loadTodaysBrief(address);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadTodaysBrief(addr: string) {
    await runPipeline(addr);
  }

  async function runPipeline(addr: string) {
    setLoading(true);
    setError(null);
    try {
      const profileRaw = localStorage.getItem("kissin_profile");
      const user: UserProfile = profileRaw
        ? JSON.parse(profileRaw)
        : { address: addr, level: "builder", topics: ["llms"], createdAt: Date.now() };
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTranscript(data.transcript);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run pipeline");
    } finally {
      setLoading(false);
    }
  }

  const address = account?.address || (typeof window !== "undefined" ? localStorage.getItem("kissin_address") : null);

  return (
    <div className="min-h-screen relative bg-black">
      {/* Full page ferrofluid background */}
      <div className="fixed inset-0 z-0">
        <Ferrofluid
          colors={["#2dd4bf", "#f43f5e", "#0d9488", "#9f1239", "#134e4a"]}
          speed={0.25}
          scale={1.6}
          turbulence={0.7}
          fluidity={0.12}
          rimWidth={0.22}
          sharpness={2.5}
          shimmer={1.2}
          glow={2}
          flowDirection="down"
          opacity={0.5}
          mouseInteraction
          mouseStrength={0.8}
          mouseRadius={0.35}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tighter">KISSIN</h1>
            <p className="text-gray-500 text-xs">Keep It Simple or I&apos;ll go INSane</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/capsules" className="text-gray-500 text-xs hover:text-white transition">My Capsules</Link>
            <ConnectButton />
          </div>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="text-teal-400 text-sm mb-2 animate-pulse">Running agents...</div>
            <p className="text-gray-600 text-xs">Hype vs Skeptic debate in progress</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-center">
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <button
              onClick={() => address && runPipeline(address)}
              className="text-xs text-red-400 border border-red-800 px-4 py-2 rounded-full hover:bg-red-900/30"
            >
              Retry
            </button>
          </div>
        )}

        {transcript && !loading && <DebateArena transcript={transcript} />}

        {!transcript && !loading && !error && (
          <div className="text-center py-20 text-gray-600 text-sm">Loading today&apos;s brief...</div>
        )}
      </div>
    </div>
  );
}
