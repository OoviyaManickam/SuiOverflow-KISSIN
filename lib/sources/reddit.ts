import { AIStory } from "@/types";

const SUBREDDITS = ["MachineLearning", "artificial", "LocalLLaMA"];

interface RedditPost {
  data: {
    title: string;
    url: string;
    score: number;
    selftext: string;
    permalink: string;
  };
}

export async function fetchReddit(): Promise<AIStory[]> {
  const stories: AIStory[] = [];

  for (const sub of SUBREDDITS) {
    try {
      const res = await fetch(
        `https://www.reddit.com/r/${sub}/hot.json?limit=10`,
        { headers: { "User-Agent": "KISSIN/1.0" } }
      );
      const data = await res.json();
      const posts: RedditPost[] = data?.data?.children || [];

      posts.forEach((post) => {
        stories.push({
          title: post.data.title,
          url: `https://reddit.com${post.data.permalink}`,
          source: `r/${sub}`,
          score: post.data.score,
          summary: post.data.selftext?.slice(0, 200) || post.data.title,
        });
      });
    } catch {
      continue;
    }
  }

  return stories.sort((a, b) => b.score - a.score).slice(0, 5);
}
