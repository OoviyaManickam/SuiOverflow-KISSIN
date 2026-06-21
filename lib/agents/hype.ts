import Groq from "groq-sdk";
import { AIStory, AgentArgument } from "@/types";
import { hypeMemWal } from "@/lib/memwal";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function runHypeAgent(story: AIStory): Promise<AgentArgument> {
  const memwal = hypeMemWal();
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

  const prompt = `You are the HYPE AGENT for KISSIN — an AI news signal detector.

Your job: build the strongest possible case for why this AI story MATTERS and deserves attention.

Story: "${story.title}"
Source: ${story.source}
Summary: ${story.summary}

Your past track record on similar topics:
${pastContext || "No history yet — this is your first verdict."}

Instructions:
- Make a compelling, specific argument for why this is significant
- Reference real technical or market implications
- Be confident but honest — don't oversell
- Keep it under 150 words
- End with a conviction score 0-100 (how strongly you believe this matters)

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
    // non-fatal — memory store failure doesn't block pipeline
  }

  return {
    agent: "hype",
    topic: story.title,
    argument,
    conviction,
    pastContext,
  };
}
