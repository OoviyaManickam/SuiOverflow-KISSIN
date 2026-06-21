import { DebateVerdict } from "@/types";

const VERDICT_STYLES = {
  signal: { bg: "bg-teal-400/10", border: "border-teal-400/40", text: "text-teal-400", label: "SIGNAL" },
  noise: { bg: "bg-red-500/10", border: "border-red-500/40", text: "text-red-400", label: "NOISE" },
  mixed: { bg: "bg-amber-400/10", border: "border-amber-400/40", text: "text-amber-400", label: "MIXED" },
};

export function VerdictCard({ verdict }: { verdict: DebateVerdict }) {
  const style = VERDICT_STYLES[verdict.verdict];
  return (
    <div className={`${style.bg} border ${style.border} rounded-xl p-5 text-center`}>
      <div className={`${style.text} text-xs font-bold tracking-widest mb-2`}>
        ⚖ VERDICT — {style.label}
      </div>
      <div className={`${style.text} text-2xl font-black mb-1`}>
        {verdict.confidence}% confident
      </div>
      <p className="text-gray-300 text-sm leading-relaxed mb-3">{verdict.explanation}</p>
      {verdict.userContext && (
        <p className="text-gray-400 text-xs italic border-t border-gray-700 pt-3 mt-3">
          For you: {verdict.userContext}
        </p>
      )}
    </div>
  );
}
