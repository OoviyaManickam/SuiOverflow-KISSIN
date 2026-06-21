# KISSIN — Keep It Simple or I'll go INSane

> An AI-powered news signal detector for tech enthusiasts who are drowning in the noise.
> Built on **Sui** · Stored on **Walrus** · Deployed on **Vercel**

**Live Demo:** https://sui-overflow-kissin.vercel.app  
**Demo Video:** https://youtu.be/is0sZf_R0Gg

---

## The Problem

Every day, hundreds of posts, papers, announcements, and hot takes flood every technology platform simultaneously. For someone who genuinely wants to stay current with AI — not just scroll past it — this creates a paradox: the more you try to keep up, the further behind you feel. By the time you've evaluated one story, twenty more have dropped and whatever you were reading is apparently already outdated.

The platforms are not the problem. The problem is there is no filter built *for you*. There is no signal layer. There is only noise.

KISSIN is that signal layer.

---

## The Solution

KISSIN runs a daily multi-agent debate on the top breaking AI story, then delivers a personalised verdict — stored permanently on-chain — telling you whether that story is worth your time given who you are and what you are building.

Three agents, one clean answer.

---

## How It Works

```
┌─────────────────────────────────┐
│      Breaking AI Story          │  ← fetched from HN, arXiv, RSS, Reddit
└────────────────┬────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌───────────────┐  ┌──────────────────┐
│  Hype Agent   │  │  Skeptic Agent   │
│  argues why   │  │  argues why      │
│  this matters │  │  this is noise   │
└───────┬───────┘  └────────┬─────────┘
        └────────┬───────────┘
                 │  + your profile (level, topics, history)
                 ▼
        ┌─────────────────┐
        │  Validator Agent │
        │  unbiased verdict│
        │  tailored to you │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │  Walrus Blob     │  ← full transcript stored
        │  Sui Capsule NFT │  ← verdict minted on-chain
        └─────────────────┘
```

### Agent Roles

| Agent | Role | Output |
|---|---|---|
| **Hype** | Argues the bull case — why this story matters, what it unlocks | Argument + conviction score (0–100) |
| **Skeptic** | Argues the opposite — what is overblown, what is missing | Argument + conviction score (0–100) |
| **Validator** | Reads both sides through the user's lens — level, topics, past capsule history | Verdict: `signal` / `noise` / `mixed` + confidence % + explanation |

The Validator is not a simple average. It has access to the user's knowledge level, topic preferences, and their full Walrus-stored capsule history, so its judgement compounds over time.

### Verdict Types

- **signal** — this is genuinely worth your attention right now
- **noise** — real story, not relevant to you today
- **mixed** — has substance but proceed with calibrated scepticism

---

## Walrus Integration

Walrus is the core persistence layer of KISSIN. Every debate transcript — the full Hype argument, Skeptic argument, Validator reasoning, and final verdict — is serialised to JSON and written to Walrus as a certified blob.

### What gets stored

```typescript
interface DebateTranscript {
  topic: string;          // story title
  topicUrl: string;       // source URL
  topicSource: string;    // HackerNews | arXiv | etc.
  hypeArgument: {
    argument: string;     // full argument text
    conviction: number;   // 0–100
    pastContext: string;  // pulled from prior capsules
  };
  skepticArgument: {
    argument: string;
    conviction: number;
    pastContext: string;
  };
  verdict: {
    verdict: "signal" | "noise" | "mixed";
    confidence: number;   // 0–100
    explanation: string;  // human-readable reasoning
    userContext: string;  // how the user's profile shaped the verdict
  };
  timestamp: number;
}
```

### Storage flow

```typescript
// lib/walrus.ts
export async function storeBlob(data: object): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  const res = await fetch(`${PUBLISHER}/v1/blobs?epochs=10`, {
    method: "PUT",
    body: bytes,
    headers: { "Content-Type": "application/json" },
  });
  const result = await res.json();
  return result.newlyCreated?.blobObject?.blobId
      || result.alreadyCertified?.blobId;
}
```

- Stored for **10 epochs** on Walrus testnet
- The returned `blobId` is written into the Sui capsule object at mint time, creating an immutable pointer from chain → storage
- Any capsule can be fully reconstructed from the on-chain `walrus_blob_id` field — the NFT is the receipt, Walrus is the proof

### Reading back

```typescript
export async function readBlob(blobId: string): Promise<object> {
  const res = await fetch(`${AGGREGATOR}/v1/blobs/${blobId}`);
  return JSON.parse(await res.text());
}
```

Transcripts are verifiable at `https://walruscan.com/testnet/blob/<blobId>` — every capsule in the UI links directly to its Walruscan entry.

---

## Sui Integration

### Move Contract

```move
module kissin::capsule {
    public struct KISSINCapsule has key, store {
        id: UID,
        topic: String,
        verdict: String,
        confidence: u8,
        walrus_blob_id: String,   // pointer to full transcript on Walrus
        epoch: u64,
        timestamp: u64,
    }

    public entry fun mint_capsule(
        topic: String,
        verdict: String,
        confidence: u8,
        walrus_blob_id: String,
        recipient: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ) { ... }
}
```

- Package deployed on Sui **testnet**: `0x5626b623805b269052e2938f54cecf4b3537e5da1ada70ed6448739f6bf82069`
- Capsules are owned objects — they live in the user's wallet
- `walrus_blob_id` creates a verifiable, permanent link between the on-chain NFT and the off-chain transcript
- Minting uses `@mysten/dapp-kit` `useSignAndExecuteTransaction` — the user's own wallet signs and pays gas, no server-side key management

### Client-side Minting

```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::capsule::mint_capsule`,
  arguments: [
    tx.pure.string(transcript.topic),
    tx.pure.string(transcript.verdict.verdict),
    tx.pure.u8(transcript.verdict.confidence),
    tx.pure.string(blobId),
    tx.pure.address(address),
    tx.object(CLOCK),
  ],
});
const result = await signAndExecute({ transaction: tx });
```

---

## Architecture

```
app/
├── page.tsx              # Landing — wallet connect, session reset
├── onboarding/page.tsx   # Profile setup — level + topics
├── debate/page.tsx       # Daily debate — runs pipeline on load
├── capsules/page.tsx     # Capsule vault — all minted verdicts
└── api/
    ├── pipeline/         # Runs full agent pipeline
    ├── capsules/         # Reads capsules from Sui
    ├── transcript/       # Reads transcripts from Walrus
    └── mint/             # Stores transcript to Walrus

lib/
├── pipeline.ts           # Orchestrator — fetch → debate → store
├── walrus.ts             # Blob store + read + explorer URL
├── sui.ts                # getUserCapsules, getCapsuleById
├── memwal.ts             # @mysten-incubation/memwal agent memory
├── agents/
│   ├── hype.ts           # Hype agent (Groq / LLaMA 3)
│   ├── skeptic.ts        # Skeptic agent (Groq / LLaMA 3)
│   └── validator.ts      # Validator agent (Groq / LLaMA 3)
└── sources/
    ├── hackernews.ts     # HN top stories
    ├── arxiv.ts          # arXiv ML papers
    ├── rss.ts            # Anthropic, HuggingFace, OpenAI blogs
    └── reddit.ts         # r/MachineLearning, r/LocalLLaMA

move/
└── sources/capsule.move  # KISSINCapsule struct + mint_capsule entry

components/
├── DebateArena.tsx       # Hype vs Skeptic UI + mint flow
├── VerdictCard.tsx       # Verdict display
├── CapsuleCard.tsx       # Single capsule in vault
├── WalrusProof.tsx       # Blob ID + Walruscan link footer
└── Ferrofluid.tsx        # WebGL background animation (ogl)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), Tailwind CSS |
| Wallet | `@mysten/dapp-kit` — ConnectButton, useSignAndExecuteTransaction |
| Agents | Groq SDK (LLaMA 3.3 70B) |
| Agent Memory | `@mysten-incubation/memwal` |
| Blob Storage | **Walrus** (PUT/GET via REST API) |
| Smart Contract | Sui Move — `KISSINCapsule` owned object |
| Sui Client | `@mysten/sui` — SuiClient, Transaction |
| Deployment | Vercel |

---

## Local Development

```bash
git clone <repo>
cd KISSIN
npm install

# Copy and fill environment variables
cp .env.example .env.local
```

`.env.local` requires:

```env
GROQ_API_KEY=                        # Groq API key (LLaMA 3)
MEMWAL_PRIVATE_KEY=                  # Ed25519 private key for agent memory
WALRUS_PUBLISHER=https://wal-publisher-testnet.staketab.org
WALRUS_AGGREGATOR=https://wal-aggregator-testnet.staketab.org
NEXT_PUBLIC_KISSIN_PACKAGE_ID=0x5626b623805b269052e2938f54cecf4b3537e5da1ada70ed6448739f6bf82069
```

```bash
npm run dev
# open http://localhost:3000
```

### Publish Move contract (if redeploying)

```bash
cd move
sui client publish . --gas-budget 100000000
# update NEXT_PUBLIC_KISSIN_PACKAGE_ID with new package ID
```

---

## Walrus: Current Usage

| Usage | Detail |
|---|---|
| **Write** | `PUT /v1/blobs?epochs=10` — full JSON transcript per debate |
| **Read** | `GET /v1/blobs/:blobId` — reconstruct transcript for capsule detail view |
| **Pointer** | `blobId` stored in Sui capsule object field — chain → storage link |
| **Explorer** | Every capsule UI card links to `walruscan.com/testnet/blob/:blobId` |
| **Epochs** | 10 epochs per blob (~10 days on testnet, upgradeable to mainnet permanent) |

---

## Walrus: Future Roadmap

This is where KISSIN's value compounds the most. Walrus is not just used as dumb file storage — it is the persistent memory layer that makes the agents smarter over time.

### 1. Persistent Agent Memory via Walrus

Right now each agent runs fresh per session. The plan is to store the agent's full reasoning history — every argument it has made, every verdict it has issued — as rolling Walrus blobs, keyed by user address. The Validator will load this context window on every run, making its judgements increasingly calibrated to your actual behaviour over weeks and months.

```
User mints capsule N
  → append transcript to user's history blob on Walrus
  → next debate: Validator loads last 20 transcripts as context
  → verdicts become sharper as history grows
```

### 2. Cross-User Signal Aggregation

Each KISSIN user produces a verdict: signal, noise, or mixed. With Walrus as a shared blob store, we can aggregate these anonymously — blobs keyed by story hash — to produce a community-level confidence score for any given story. This turns KISSIN from a personal filter into a collective intelligence layer on top of the AI news cycle.

### 3. Subscription Feed via Walrus Sites

Using **Walrus Sites**, we plan to publish a daily curated feed as a fully decentralised static site — no server, no API, just a Walrus blob that gets replaced daily with the top verdicts from across all KISSIN users. Anyone can subscribe to it and read it from any Walrus gateway.

### 4. Long-Form Research Capsules

Currently a capsule stores one verdict on one story. The next version extends this to multi-story research threads — a user can ask KISSIN to follow a topic across multiple days, and all the transcripts are stitched together into a long-form Walrus blob that reads like a research brief. The Sui capsule NFT becomes a pointer to the entire research arc, not just a single moment.

### 5. Verifiable Timestamps as Proof of Prior Art

Because Walrus blobs are certified on-chain with a Sui epoch timestamp, every KISSIN verdict is timestamped proof of what was known and thought at a specific moment. For researchers and builders, this is a lightweight proof-of-prior-art mechanism — you can point to a capsule and say "I evaluated this technology on this date and reached this conclusion" and it is verifiable by anyone.

---

## Why Walrus + Sui

Most AI applications store outputs in centralised databases that can be altered, deleted, or paywalled. KISSIN's core claim — that your verdict is *yours*, permanent, and tamper-proof — requires decentralised storage that is not merely a promise.

Walrus provides content-addressed, certified blob storage with economic guarantees. Sui provides ownership and composability. Together they make KISSIN's capsule model possible: a lightweight on-chain NFT that is a receipt, with Walrus as the immutable archive behind it.

The combination also makes KISSIN's future agent memory architecture feasible at scale — storing and retrieving large JSON blobs (full debate transcripts, multi-session histories) is economically viable on Walrus in a way it would not be on-chain directly.

---

## SuiOverflow 2025

Built for **SuiOverflow 2025** hackathon.  
Category: AI + Walrus  
Team: Ooviya Manikam

---

*KISSIN does not tell you what to think. It tells you what is worth thinking about.*
