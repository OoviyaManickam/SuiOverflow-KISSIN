import { AIStory } from "@/types";

export async function fetchArxiv(): Promise<AIStory[]> {
  try {
    const query = "cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL&sortBy=submittedDate&sortOrder=descending&max_results=10";
    const res = await fetch(`http://export.arxiv.org/api/query?search_query=${query}`);
    const xml = await res.text();

    const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) || [];

    return entries.slice(0, 5).map((entry) => {
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim().replace(/\s+/g, " ") || "";
      const id = entry.match(/<id>(.*?)<\/id>/)?.[1] || "";
      const summary = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.trim().slice(0, 200) || "";

      return {
        title,
        url: id,
        source: "arXiv",
        score: 0,
        summary,
      };
    });
  } catch {
    return [];
  }
}
