import type { NextConfig } from "next";

const isWalrusBuild = process.env.WALRUS_BUILD === "1";

const nextConfig: NextConfig = {
  ...(isWalrusBuild ? { output: "export" } : {}),
};

export default nextConfig;
