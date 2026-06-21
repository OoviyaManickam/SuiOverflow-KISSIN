import { fetchHackerNews } from "@/lib/sources/hackernews";
import { fetchReddit } from "@/lib/sources/reddit";
import { fetchArxiv } from "@/lib/sources/arxiv";
import { fetchRSS } from "@/lib/sources/rss";
import { runHypeAgent } from "@/lib/agents/hype";
import { runSkepticAgent } from "@/lib/agents/skeptic";
import { runValidatorAgent } from "@/lib/agents/validator";
import { storeBlob } from "@/lib/walrus";
import { AIStory, DebateTranscript, UserProfile } from "@/types";

export async function fetchAllStories(): Promise<AIStory[]> {
  const [hn, reddit, arxiv, rss] = await Promise.allSettled([
    fetchHackerNews(),
    fetchReddit(),
    fetchArxiv(),
    fetchRSS(),
  ]);

  const stories: AIStory[] = [
    ...(hn.status === "fulfilled" ? hn.value : []),
    ...(reddit.status === "fulfilled" ? reddit.value : []),
    ...(arxiv.status === "fulfilled" ? arxiv.value : []),
    ...(rss.status === "fulfilled" ? rss.value : []),
  ];

  return stories.sort((a, b) => b.score - a.score);
}

export function pickTopStory(stories: AIStory[]): AIStory {
  const prioritized = stories.filter((s) =>
    ["HackerNews", "HuggingFace Blog", "Anthropic Blog"].includes(s.source)
  );
  return prioritized[0] || stories[0];
}

export async function runPipeline(user: UserProfile): Promise<DebateTranscript> {
  console.log("[KISSIN] Starting pipeline...");

  const stories = await fetchAllStories();
  console.log(`[KISSIN] Fetched ${stories.length} stories`);

  if (stories.length === 0) throw new Error("No stories fetched from any source");

  const topic = pickTopStory(stories);
  console.log(`[KISSIN] Topic selected: ${topic.title}`);

  const [hypeArg, skepticArg] = await Promise.all([
    runHypeAgent(topic),
    runSkepticAgent(topic),
  ]);
  console.log("[KISSIN] Agents completed debate");

  const verdict = await runValidatorAgent(hypeArg, skepticArg, user);
  console.log(`[KISSIN] Verdict: ${verdict.verdict} (${verdict.confidence}%)`);

  const transcript: DebateTranscript = {
    topic: topic.title,
    topicUrl: topic.url,
    topicSource: topic.source,
    hypeArgument: hypeArg,
    skepticArgument: skepticArg,
    verdict,
    timestamp: Date.now(),
  };

  try {
    const blobId = await storeBlob(transcript);
    transcript.walrusBlobId = blobId;
    console.log(`[KISSIN] Stored on Walrus: ${blobId}`);
  } catch (err) {
    console.error("[KISSIN] Walrus store failed (non-fatal):", err);
  }

  return transcript;
}
