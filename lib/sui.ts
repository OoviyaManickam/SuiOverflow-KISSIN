import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { KISSINCapsule, Verdict } from "@/types";

export const suiClient = new SuiJsonRpcClient({
  network: "testnet",
  url: "https://fullnode.testnet.sui.io:443",
});

function fieldsFromContent(content: unknown): Record<string, unknown> | null {
  if (!content || typeof content !== "object") return null;
  const c = content as { dataType?: string; fields?: unknown };
  if (c.dataType === "moveObject" && c.fields && typeof c.fields === "object") {
    return c.fields as Record<string, unknown>;
  }
  return null;
}

export async function getUserCapsules(address: string): Promise<KISSINCapsule[]> {
  const packageId = process.env.NEXT_PUBLIC_KISSIN_PACKAGE_ID;
  if (!packageId) return [];

  try {
    const response = await suiClient.getOwnedObjects({
      owner: address,
      filter: { StructType: `${packageId}::capsule::KISSINCapsule` },
      options: { showContent: true, showType: true },
    });

    return response.data
      .map((obj) => {
        const fields = fieldsFromContent(obj.data?.content);
        if (!fields || !obj.data?.objectId) return null;
        return {
          id: obj.data.objectId,
          topic: fields.topic as string,
          verdict: fields.verdict as Verdict,
          confidence: Number(fields.confidence),
          walrusBlobId: fields.walrus_blob_id as string,
          epoch: Number(fields.epoch),
          timestamp: Number(fields.timestamp),
        };
      })
      .filter((c): c is KISSINCapsule => c !== null)
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

export async function getCapsuleById(objectId: string): Promise<KISSINCapsule | null> {
  try {
    const response = await suiClient.getObject({
      id: objectId,
      options: { showContent: true },
    });
    const fields = fieldsFromContent(response.data?.content);
    if (!fields) return null;
    return {
      id: objectId,
      topic: fields.topic as string,
      verdict: fields.verdict as Verdict,
      confidence: Number(fields.confidence),
      walrusBlobId: fields.walrus_blob_id as string,
      epoch: Number(fields.epoch),
      timestamp: Number(fields.timestamp),
    };
  } catch {
    return null;
  }
}
