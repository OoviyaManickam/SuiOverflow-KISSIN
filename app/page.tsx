"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import "@mysten/dapp-kit/dist/index.css";

export default function Landing() {
  const router = useRouter();
  const account = useCurrentAccount();
  const clearedRef = useRef(false);

  // Clear session whenever we land on this page (disconnect/reconnect = fresh start)
  useEffect(() => {
    if (!clearedRef.current) {
      clearedRef.current = true;
      localStorage.removeItem("kissin_profile");
      localStorage.removeItem("kissin_today");
      localStorage.removeItem("kissin_address");
    }
  }, []);

  // Once wallet connects, go to preferences — always
  useEffect(() => {
    if (account?.address) {
      localStorage.setItem("kissin_address", account.address);
      router.push("/onboarding");
    }
  }, [account?.address, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-6xl font-black tracking-tighter">KISSIN</h1>
        <p className="text-gray-400 text-lg">Keep It Simple or I&apos;ll go INSane</p>
        <p className="text-gray-600 text-sm">AI news signal detector powered by Walrus + Sui</p>
      </div>
      <ConnectButton />
    </div>
  );
}
