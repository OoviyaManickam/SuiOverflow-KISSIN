"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";
import "@mysten/dapp-kit/dist/index.css";
import Link from "next/link";
import { CapsuleCard } from "@/components/CapsuleCard";
import { KISSINCapsule } from "@/types";

export default function Capsules() {
  const router = useRouter();
  const account = useCurrentAccount();
  const [capsules, setCapsules] = useState<KISSINCapsule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const address = account?.address || localStorage.getItem("kissin_address");
    if (!address) { router.push("/"); return; }
    fetch(`/api/capsules?address=${address}`)
      .then((r) => r.json())
      .then((data) => setCapsules(data.capsules || []))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.address]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tighter">My Capsules</h1>
          <p className="text-gray-500 text-xs">{capsules.length} verdict{capsules.length !== 1 ? "s" : ""} minted on Sui</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/debate" className="text-gray-500 text-xs hover:text-white transition">← Today&apos;s Debate</Link>
          <ConnectButton />
        </div>
      </div>

      {loading && <p className="text-gray-600 text-center py-10">Loading capsules...</p>}

      {!loading && capsules.length === 0 && (
        <div className="text-center py-20 space-y-3">
          <p className="text-gray-500 text-sm">No capsules yet.</p>
          <p className="text-gray-700 text-xs">Mint your first one after today&apos;s debate.</p>
          <Link href="/debate"
            className="inline-block mt-2 bg-teal-400 text-black font-bold px-6 py-2 rounded-full text-sm hover:bg-teal-300 transition">
            Go to Debate →
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {capsules.map((c) => <CapsuleCard key={c.id} capsule={c} />)}
      </div>
    </div>
  );
}
