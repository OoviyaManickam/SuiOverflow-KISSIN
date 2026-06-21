"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import "@mysten/dapp-kit/dist/index.css";
import dynamic from "next/dynamic";

const Ferrofluid = dynamic(() => import("@/components/Ferrofluid"), { ssr: false });

export default function Landing() {
  const router = useRouter();
  const account = useCurrentAccount();
  const clearedRef = useRef(false);

  useEffect(() => {
    if (!clearedRef.current) {
      clearedRef.current = true;
      localStorage.removeItem("kissin_profile");
      localStorage.removeItem("kissin_today");
      localStorage.removeItem("kissin_address");
    }
  }, []);

  useEffect(() => {
    if (account?.address) {
      localStorage.setItem("kissin_address", account.address);
      router.push("/onboarding");
    }
  }, [account?.address, router]);

  return (
    <div className="min-h-screen relative bg-black">
      <div className="absolute inset-0 z-0">
        <Ferrofluid
          colors={["#2dd4bf", "#f43f5e", "#0d9488", "#881337", "#134e4a"]}
          speed={0.3}
          scale={1.6}
          turbulence={0.8}
          fluidity={0.12}
          rimWidth={0.25}
          sharpness={2.5}
          shimmer={1.2}
          glow={2.5}
          flowDirection="down"
          opacity={0.7}
          mouseInteraction
          mouseStrength={1}
          mouseRadius={0.35}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-8xl font-black tracking-tighter">💋 KISSIN</h1>
          <p className="text-gray-400 text-lg">Keep It Simple or I&apos;ll go INSane</p>
          <p className="text-gray-500 text-sm">AI news signal detector powered by Walrus + Sui</p>
        </div>
        <ConnectButton />
      </div>
    </div>
  );
}
