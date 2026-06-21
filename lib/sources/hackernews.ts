import { AIStory } from "@/types";

const HN_BASE = "https://hacker-news.firebaseio.com/v0";
const AI_KEYWORDS = ["ai", "llm", "gpt", "claude", "gemini", "openai", "anthropic", "mistral", "groq", "nvidia", "machine learning", "deep learning", "neural", "agent", "model"];

interface HNItem {
  id: number;
  title: string;
  url?: string;
  score: number;
  type: string;
}

function isAIRelated(title: string): boolean {
  const lower = title.toLowerCase();
  return AI_KEYWORDS.some((k) => lower.includes(k));
}

export async function fetchHackerNews(): Promise<AIStory[]> {
  try {
    const res = await fetch(`${HN_BASE}/topstories.json`);
    const ids: number[] = await res.json();
    const top50 = ids.slice(0, 50);

    const items = await Promise.all(
      top50.map((id) =>
        fetch(`${HN_BASE}/item/${id}.json`)
          .then((r) => r.json())
          .catch(() => null)
      )
    );

    return items
      .filter((item): item is HNItem => item && item.type === "story" && item.title && isAIRelated(item.title))
      .map((item) => ({
        title: item.title,
        url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
        source: "HackerNews",
        score: item.score,
        summary: item.title,
      }))
      .slice(0, 5);
  } catch {
    return [];
  }
}
