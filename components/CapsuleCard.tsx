import Link from "next/link";
import { KISSINCapsule } from "@/types";

const VERDICT_STYLES = {
  signal: "bg-teal-400/10 text-teal-400 border-teal-400/30",
  noise: "bg-red-400/10 text-red-400 border-red-400/30",
  mixed: "bg-amber-400/10 text-amber-400 border-amber-400/30",
};

export function CapsuleCard({ capsule }: { capsule: KISSINCapsule }) {
  const date = new Date(capsule.timestamp).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  return (
    <Link href={`/capsule/${capsule.id}`}>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between hover:border-gray-600 transition cursor-pointer">
        <div>
          <p className="text-white text-sm font-semibold line-clamp-1">{capsule.topic}</p>
          <p className="text-gray-500 text-xs mt-1">{date}</p>
        </div>
        <span className={`border px-3 py-1 rounded-full text-xs font-bold uppercase ${VERDICT_STYLES[capsule.verdict]}`}>
          {capsule.verdict}
        </span>
      </div>
    </Link>
  );
}
