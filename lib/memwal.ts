import { MemWal } from "@mysten-incubation/memwal";

const MEMWAL_CONFIG = {
  key: process.env.MEMWAL_PRIVATE_KEY!,
  accountId: process.env.MEMWAL_ACCOUNT_ID!,
  serverUrl: process.env.MEMWAL_SERVER_URL || "https://relayer.memory.walrus.xyz",
};

export function createMemWal(namespace: string) {
  return MemWal.create({ ...MEMWAL_CONFIG, namespace });
}

export const hypeMemWal = () => createMemWal("kissin-hype");
export const skepticMemWal = () => createMemWal("kissin-skeptic");
export const validatorMemWal = () => createMemWal("kissin-validator");
export const userMemWal = (address: string) => createMemWal(`kissin-user-${address}`);
