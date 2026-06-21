"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { DebateTranscript } from "@/types";
import { VerdictCard } from "./VerdictCard";
import { WalrusProof } from "./WalrusProof";

const PACKAGE_ID = process.env.NEXT_PUBLIC_KISSIN_PACKAGE_ID;
const CLOCK = "0x0000000000000000000000000000000000000000000000000000000000000006";

export function DebateArena({ transcript: initial }: { transcript: DebateTranscript }) {
  const router = useRouter();
  const [transcript, setTranscript] = useState(initial);
  const [minting, setMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  async function mintCapsule() {
    if (!PACKAGE_ID) { setMintError("Package not deployed"); return; }
    setMinting(true);
    setMintError(null);
    try {
      const address = typeof window !== "undefined" ? localStorage.getItem("kissin_address") : null;
      if (!address) throw new Error("No wallet connected");

      let blobId = transcript.walrusBlobId;
      if (!blobId) {
        const res = await fetch("/api/mint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript, walrusOnly: true }),
        });
        const data = await res.json();
        blobId = data.blobId;
      }

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::capsule::mint_capsule`,
        arguments: [
          tx.pure.string(transcript.topic),
          tx.pure.string(transcript.verdict.verdict),
          tx.pure.u8(transcript.verdict.confidence),
          tx.pure.string(blobId || ""),
          tx.pure.address(address),
          tx.object(CLOCK),
        ],
      });

      const result = await signAndExecute({ transaction: tx });
      const capsuleId = (result as { digest: string; effects?: { created?: { reference: { objectId: string } }[] } })
        ?.effects?.created?.[0]?.reference?.objectId;

      setTranscript((t) => ({ ...t, walrusBlobId: blobId, suiCapsuleId: capsuleId || result.digest }));
      setTimeout(() => router.push("/capsules"), 1500);
    } catch (err) {
      setMintError(err instanceof Error ? err.message : "Mint failed");
    } finally {
      setMinting(false);
    }
  }

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="bg-gray-900 px-6 py-4 border-b border-gray-800 text-center">
        <p className="text-gray-500 text-xs tracking-widest uppercase mb-1">Today&apos;s Topic</p>
        <a href={transcript.topicUrl} target="_blank" rel="noopener noreferrer"
          className="text-white font-bold text-lg hover:text-teal-400 transition line-clamp-2">
          {transcript.topic}
        </a>
        <p className="text-gray-600 text-xs mt-1">via {transcript.topicSource}</p>
      </div>

      <div className="grid grid-cols-2">
        <div className="p-5 border-r border-gray-800 bg-teal-500/5">
          <p className="text-teal-400 text-xs font-bold tracking-widest mb-3">HYPE</p>
          <p className="text-gray-300 text-sm leading-relaxed">{transcript.hypeArgument.argument}</p>
          <div className="mt-4">
            <div className="h-1 bg-gray-800 rounded">
              <div className="h-1 bg-teal-400 rounded transition-all" style={{ width: `${transcript.hypeArgument.conviction}%` }} />
            </div>
            <p className="text-teal-400 text-xs mt-1">{transcript.hypeArgument.conviction}% conviction</p>
          </div>
        </div>

        <div className="p-5 bg-rose-500/5">
          <p className="text-rose-400 text-xs font-bold tracking-widest mb-3">SKEPTIC</p>
          <p className="text-gray-300 text-sm leading-relaxed">{transcript.skepticArgument.argument}</p>
          <div className="mt-4">
            <div className="h-1 bg-gray-800 rounded">
              <div className="h-1 bg-rose-500 rounded transition-all" style={{ width: `${transcript.skepticArgument.conviction}%` }} />
            </div>
            <p className="text-rose-400 text-xs mt-1">{transcript.skepticArgument.conviction}% conviction</p>
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-gray-800">
        <VerdictCard verdict={transcript.verdict} />

        {!transcript.suiCapsuleId && (
          <div className="mt-4 text-center">
            <button
              onClick={mintCapsule}
              disabled={minting}
              className="bg-teal-400 text-black font-bold px-6 py-2 rounded-full text-sm hover:bg-teal-300 transition disabled:opacity-50"
            >
              {minting ? "Minting..." : "Mint Capsule on Sui"}
            </button>
            {mintError && <p className="text-red-400 text-xs mt-2">{mintError}</p>}
          </div>
        )}

        {transcript.suiCapsuleId && (
          <div className="mt-4 text-center space-y-2">
            <p className="text-teal-400 text-xs font-mono">
              Capsule minted: {transcript.suiCapsuleId.slice(0, 8)}...{transcript.suiCapsuleId.slice(-4)}
            </p>
            <p className="text-gray-600 text-xs">Redirecting to your capsules...</p>
          </div>
        )}
      </div>

      <WalrusProof blobId={transcript.walrusBlobId} capsuleId={transcript.suiCapsuleId} />
    </div>
  );
}
