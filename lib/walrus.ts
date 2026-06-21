const PUBLISHER = process.env.WALRUS_PUBLISHER || "https://publisher.walrus-testnet.walrus.space";
const AGGREGATOR = process.env.WALRUS_AGGREGATOR || "https://aggregator.walrus-testnet.walrus.space";

export async function storeBlob(data: object): Promise<string> {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);

  const res = await fetch(`${PUBLISHER}/v1/blobs?epochs=10`, {
    method: "PUT",
    body: bytes,
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error(`Walrus store failed: ${res.status}`);

  const result = await res.json();
  const blobId = result.newlyCreated?.blobObject?.blobId || result.alreadyCertified?.blobId;
  if (!blobId) throw new Error("No blob ID in response");
  return blobId;
}

export async function readBlob(blobId: string): Promise<object> {
  const res = await fetch(`${AGGREGATOR}/v1/blobs/${blobId}`);
  if (!res.ok) throw new Error(`Walrus read failed: ${res.status}`);
  const text = await res.text();
  return JSON.parse(text);
}

export function walrusExplorerUrl(blobId: string): string {
  return `https://walruscan.com/testnet/blob/${blobId}`;
}
