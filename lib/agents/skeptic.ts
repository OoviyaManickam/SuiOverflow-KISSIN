import Groq from "groq-sdk";
import { AIStory, AgentArgument } from "@/types";
import { skepticMemWal } from "@/lib/memwal";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function runSkepticAgent(story: AIStory): Promise<AgentArgument> {
  const memwal = skepticMemWal();
  let pastContext = "";

  try {
    const recalled = await memwal.recall({
      query: `past verdicts about ${story.title}`,
      limit: 3,
    });
    pastContext = recalled.results?.map((r) => r.text).join("\n") || "";
  } catch {
    pastContext = "No past context available yet.";
  }

  const prompt = `You are the SKEPTIC AGENT for KISSIN — an AI news signal detector.

Your job: build the strongest possible case for why this AI story is NOISE — overhyped, misleading, or not worth attention.

Story: "${story.title}"
Source: ${story.source}
Summary: ${story.summary}

Your past track record on similar topics:
${pastContext || "No history yet — this is your first verdict."}

Instructions:
- Make a specific, well-reasoned argument for why this is hype or noise
- Reference historical patterns of similar hype cycles in AI
- Be critical but fair — don't dismiss without reason
- Keep it under 150 words
- End with a conviction score 0-100 (how strongly you believe this is noise)

Format your response as:
ARGUMENT: [your argument]
CONVICTION: [0-100]`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 300,
  });

  const text = response.choices[0].message.content || "";
  const argument = text.match(/ARGUMENT:\s*([\s\S]*?)(?=CONVICTION:|$)/)?.[1]?.trim() || text;
  const conviction = parseInt(text.match(/CONVICTION:\s*(\d+)/)?.[1] || "70");

  try {
    await memwal.rememberAndWait(
      `Topic: ${story.title} | Argument: ${argument} | Conviction: ${conviction}`
    );
  } catch {
    // non-fatal
  }

  return {
    agent: "skeptic",
    topic: story.title,
    argument,
    conviction,
    pastContext,
  };
}
