import Groq from "groq-sdk";
import { AgentArgument, DebateVerdict, UserProfile } from "@/types";
import { validatorMemWal } from "@/lib/memwal";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function runValidatorAgent(
  hype: AgentArgument,
  skeptic: AgentArgument,
  user: UserProfile
): Promise<DebateVerdict> {
  const memwal = validatorMemWal();
  let validatorHistory = "";

  try {
    const recalled = await memwal.recall({
      query: `past verdicts accuracy track record`,
      limit: 5,
    });
    validatorHistory = recalled.results?.map((r) => r.text).join("\n") || "";
  } catch {
    validatorHistory = "No history yet.";
  }

  const levelContext = {
    beginner: "Explain as if to someone just getting into AI. Use analogies. Avoid jargon.",
    builder: "Explain for a developer who builds with AI tools. Focus on practical implications.",
    researcher: "Explain for someone deep in the field. Technical depth welcome.",
  }[user.level];

  const prompt = `You are the VALIDATOR for KISSIN — an AI news signal detector.

Two agents have debated today's top AI story. Your job: weigh their arguments and deliver ONE honest verdict.

TOPIC: "${hype.topic}"

HYPE AGENT argues (conviction: ${hype.conviction}/100):
${hype.argument}

SKEPTIC AGENT argues (conviction: ${skeptic.conviction}/100):
${skeptic.argument}

YOUR PAST VERDICT ACCURACY:
${validatorHistory || "No history yet — first verdict."}

USER PROFILE:
- Knowledge level: ${user.level}
- Topics they care about: ${user.topics.join(", ")}
- Audience context: ${levelContext}

Instructions:
- Weigh both arguments honestly
- Consider the agents' conviction scores and track records
- Produce ONE verdict: signal, noise, or mixed
- Give a confidence score 0-100
- Write a 2-sentence explanation
- Write 1 sentence specifically for this user's level and topics

Format:
VERDICT: [signal|noise|mixed]
CONFIDENCE: [0-100]
EXPLANATION: [2 sentences]
FOR_YOU: [1 personalized sentence]`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 400,
  });

  const text = response.choices[0].message.content || "";
  const verdict = (text.match(/VERDICT:\s*(signal|noise|mixed)/i)?.[1]?.toLowerCase() || "mixed") as "signal" | "noise" | "mixed";
  const confidence = parseInt(text.match(/CONFIDENCE:\s*(\d+)/)?.[1] || "60");
  const explanation = text.match(/EXPLANATION:\s*([\s\S]*?)(?=FOR_YOU:|$)/)?.[1]?.trim() || text;
  const userContext = text.match(/FOR_YOU:\s*([\s\S]*?)$/)?.[1]?.trim() || "";

  try {
    await memwal.rememberAndWait(
      `Topic: ${hype.topic} | Verdict: ${verdict} | Confidence: ${confidence}`
    );
  } catch {
    // non-fatal
  }

  return { verdict, confidence, explanation, userContext };
}
