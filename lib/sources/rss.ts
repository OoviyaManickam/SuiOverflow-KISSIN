import { AIStory } from "@/types";

const RSS_FEEDS = [
  { url: "https://huggingface.co/blog/feed.xml", source: "HuggingFace Blog" },
  { url: "https://www.anthropic.com/news/rss.xml", source: "Anthropic Blog" },
  { url: "https://techcrunch.com/category/artificial-intelligence/feed/", source: "TechCrunch AI" },
];

export async function fetchRSS(): Promise<AIStory[]> {
  const stories: AIStory[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const res = await fetch(feed.url);
      const xml = await res.text();
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

      items.slice(0, 3).forEach((item) => {
        const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
          item.match(/<title>(.*?)<\/title>/)?.[1] || "";
        const link = item.match(/<link>(.*?)<\/link>/)?.[1] ||
          item.match(/<link\s+href="(.*?)"/)?.[1] || "";
        const desc = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ||
          item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "";

        if (title) {
          stories.push({
            title: title.trim(),
            url: link.trim(),
            source: feed.source,
            score: 100,
            summary: desc.replace(/<[^>]*>/g, "").trim().slice(0, 200),
          });
        }
      });
    } catch {
      continue;
    }
  }

  return stories.slice(0, 5);
}
