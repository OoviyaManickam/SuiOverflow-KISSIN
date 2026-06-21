import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { runPipeline } from "../lib/pipeline";
import { UserProfile } from "../types";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = new SuiJsonRpcClient({ network: "testnet", url: "https://fullnode.testnet.sui.io:443" });
const PACKAGE_ID = process.env.NEXT_PUBLIC_KISSIN_PACKAGE_ID!;

const DEMO_USER: UserProfile = {
  address: process.env.SUI_WALLET_ADDRESS!,
  level: "builder",
  topics: ["llms", "infra", "startups"],
  createdAt: Date.now(),
};

async function listen() {
  console.log("[KISSIN Listener] Starting event listener...");
  console.log(`[KISSIN Listener] Watching package: ${PACKAGE_ID}`);

  // @ts-expect-error subscribeEvent exists on the underlying transport
  await client.subscribeEvent({
    filter: { MoveEventType: `${PACKAGE_ID}::trigger::RunKISSIN` },
    onMessage: async (event: unknown) => {
      console.log("[KISSIN Listener] RunKISSIN event detected:", event);
      try {
        const transcript = await runPipeline(DEMO_USER);
        console.log("[KISSIN Listener] Pipeline complete:", transcript.verdict);
      } catch (err) {
        console.error("[KISSIN Listener] Pipeline failed:", err);
      }
    },
  });
}

listen().catch(console.error);
