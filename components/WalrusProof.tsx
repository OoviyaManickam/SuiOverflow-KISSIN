import { walrusExplorerUrl } from "@/lib/walrus";

export function WalrusProof({ blobId, capsuleId }: { blobId?: string; capsuleId?: string }) {
  if (!blobId) return null;
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-t border-gray-800 text-xs">
      <span className="text-gray-600">
        🐋 Walrus blob: {blobId.slice(0, 10)}...
      </span>
      <div className="flex gap-3">
        {capsuleId && (
          <span className="text-gray-600">Capsule #{capsuleId.slice(-4)}</span>
        )}
        <a
          href={walrusExplorerUrl(blobId)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-500 hover:text-teal-400"
        >
          Verify →
        </a>
      </div>
    </div>
  );
}
