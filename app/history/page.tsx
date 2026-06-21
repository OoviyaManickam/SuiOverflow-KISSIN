"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CapsuleCard } from "@/components/CapsuleCard";
import { KISSINCapsule } from "@/types";

export default function History() {
  const router = useRouter();
  const [capsules, setCapsules] = useState<KISSINCapsule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const address = localStorage.getItem("kissin_address");
    if (!address) { router.push("/onboarding"); return; }
    fetch(`/api/capsules?address=${address}`)
      .then((r) => r.json())
      .then((data) => setCapsules(data.capsules || []))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tighter">Your Capsules</h1>
          <p className="text-gray-500 text-xs">{capsules.length} verdicts owned on Sui</p>
        </div>
        <Link href="/" className="text-gray-500 text-xs hover:text-white transition">← Today</Link>
      </div>

      {loading && <p className="text-gray-600 text-center py-10">Loading capsules...</p>}

      {!loading && capsules.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-600 text-sm">No capsules yet.</p>
          <p className="text-gray-700 text-xs mt-1">Run today&apos;s pipeline to get your first one.</p>
        </div>
      )}

      <div className="space-y-3">
        {capsules.map((c) => <CapsuleCard key={c.id} capsule={c} />)}
      </div>
    </div>
  );
}
