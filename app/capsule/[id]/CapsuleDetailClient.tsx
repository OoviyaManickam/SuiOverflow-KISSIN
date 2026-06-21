"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DebateArena } from "@/components/DebateArena";
import { DebateTranscript, KISSINCapsule } from "@/types";
import { walrusExplorerUrl } from "@/lib/walrus";

export function CapsuleDetailClient() {
  const { id } = useParams<{ id: string }>();
  const [capsule, setCapsule] = useState<KISSINCapsule | null>(null);
  const [transcript, setTranscript] = useState<DebateTranscript | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const capsuleRes = await fetch(`/api/capsules?objectId=${id}`);
        const capsuleData = await capsuleRes.json();
        setCapsule(capsuleData.capsule);

        if (capsuleData.capsule?.walrusBlobId) {
          const transcriptRes = await fetch(`/api/transcript/${capsuleData.capsule.walrusBlobId}`);
          const transcriptData = await transcriptRes.json();
          setTranscript(transcriptData.transcript);
        }
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Link href="/history" className="text-gray-500 text-xs hover:text-white transition">← History</Link>
        {capsule?.walrusBlobId && (
          <a
            href={walrusExplorerUrl(capsule.walrusBlobId)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-500 text-xs hover:text-teal-400"
          >
            View on Walrus Explorer →
          </a>
        )}
      </div>

      {loading && <p className="text-gray-600 text-center py-10">Loading capsule...</p>}
      {!loading && transcript && <DebateArena transcript={transcript} />}
      {!loading && !transcript && capsule && (
        <div className="text-center py-10">
          <p className="text-gray-400 text-sm font-bold">{capsule.topic}</p>
          <p className="text-gray-600 text-xs mt-2">Full transcript unavailable</p>
        </div>
      )}
    </div>
  );
}
