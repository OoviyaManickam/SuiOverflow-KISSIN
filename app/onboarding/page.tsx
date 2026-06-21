"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import dynamic from "next/dynamic";
import { KnowledgeLevel, Topic, UserProfile } from "@/types";

const Ferrofluid = dynamic(() => import("@/components/Ferrofluid"), { ssr: false });

const TOPICS: { id: Topic; label: string; desc: string }[] = [
  { id: "llms", label: "LLMs", desc: "Large language models & assistants" },
  { id: "infra", label: "Infra", desc: "ML infrastructure & deployment" },
  { id: "startups", label: "Startups", desc: "AI companies & funding" },
  { id: "research", label: "Research", desc: "Papers & breakthroughs" },
  { id: "tools", label: "Tools", desc: "Dev tools & frameworks" },
];

export default function Onboarding() {
  const router = useRouter();
  const account = useCurrentAccount();
  const [level, setLevel] = useState<KnowledgeLevel>("builder");
  const [topics, setTopics] = useState<Topic[]>(["llms"]);

  useEffect(() => {
    if (!account?.address && !localStorage.getItem("kissin_address")) {
      router.push("/");
    }
  }, [account?.address, router]);

  function toggleTopic(t: Topic) {
    setTopics((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  }

  function finish() {
    const address = account?.address || localStorage.getItem("kissin_address");
    if (!address) return;
    const profile: UserProfile = { address, level, topics, createdAt: Date.now() };
    localStorage.setItem("kissin_profile", JSON.stringify(profile));
    localStorage.setItem("kissin_address", address);
    router.push("/debate");
  }

  return (
    <div className="min-h-screen relative bg-black">
      {/* Ferrofluid background */}
      <div className="absolute inset-0 z-0">
        <Ferrofluid
          colors={["#2dd4bf", "#0d9488", "#134e4a"]}
          speed={0.3}
          scale={1.6}
          turbulence={0.8}
          fluidity={0.12}
          rimWidth={0.25}
          sharpness={2.5}
          shimmer={1.2}
          glow={2.5}
          flowDirection="down"
          opacity={0.7}
          mouseInteraction
          mouseStrength={1}
          mouseRadius={0.35}
        />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tighter mb-1">Set your filters</h1>
            <p className="text-gray-400 text-sm">Agents will tailor the debate to your level</p>
          </div>

          <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
            <p className="text-gray-400 text-xs tracking-widest uppercase">I am a...</p>
            <div className="space-y-2">
              {(["beginner", "builder", "researcher"] as KnowledgeLevel[]).map((l) => (
                <button key={l} onClick={() => setLevel(l)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition ${level === l ? "bg-teal-400/20 border-teal-400 text-teal-300" : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"}`}>
                  {l === "beginner" && "Beginner — just getting into AI"}
                  {l === "builder" && "Builder — using AI in my projects"}
                  {l === "researcher" && "Researcher — deep in the field"}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
            <p className="text-gray-400 text-xs tracking-widest uppercase">I care about...</p>
            <div className="grid grid-cols-2 gap-2">
              {TOPICS.map((t) => (
                <button key={t.id} onClick={() => toggleTopic(t.id)}
                  className={`text-left px-4 py-3 rounded-xl border text-sm transition ${topics.includes(t.id) ? "bg-teal-400/20 border-teal-400 text-teal-300" : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"}`}>
                  <span className="font-bold block">{t.label}</span>
                  <span className="text-xs opacity-60">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={finish}
            disabled={topics.length === 0}
            className="w-full bg-teal-400 text-black font-bold py-3 rounded-xl hover:bg-teal-300 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            Start Listening →
          </button>
        </div>
      </div>
    </div>
  );
}
