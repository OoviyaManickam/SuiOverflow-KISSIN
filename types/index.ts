export type KnowledgeLevel = "beginner" | "builder" | "researcher";
export type Topic = "llms" | "infra" | "startups" | "research" | "tools";
export type Verdict = "signal" | "noise" | "mixed";

export interface UserProfile {
  address: string;
  level: KnowledgeLevel;
  topics: Topic[];
  createdAt: number;
}

export interface AIStory {
  title: string;
  url: string;
  source: string;
  score: number;
  summary: string;
}

export interface AgentArgument {
  agent: "hype" | "skeptic";
  topic: string;
  argument: string;
  conviction: number;
  pastContext: string;
}

export interface DebateVerdict {
  verdict: Verdict;
  confidence: number;
  explanation: string;
  userContext: string;
}

export interface DebateTranscript {
  topic: string;
  topicUrl: string;
  topicSource: string;
  hypeArgument: AgentArgument;
  skepticArgument: AgentArgument;
  verdict: DebateVerdict;
  timestamp: number;
  walrusBlobId?: string;
  suiCapsuleId?: string;
}

export interface KISSINCapsule {
  id: string;
  topic: string;
  verdict: Verdict;
  confidence: number;
  walrusBlobId: string;
  epoch: number;
  timestamp: number;
}
