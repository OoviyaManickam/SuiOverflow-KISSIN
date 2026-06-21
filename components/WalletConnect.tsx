"use client";
import { useState } from "react";

interface SuiWalletLegacy {
  requestPermissions: () => Promise<void>;
  getAccounts: () => Promise<string[]>;
}

interface WalletStandardAccount {
  address: string;
}

interface WalletStandardFeature {
  connect: (params: { silent?: boolean }) => Promise<{ accounts: WalletStandardAccount[] }>;
}

interface WalletStandard {
  name: string;
  chains: string[];
  features: Record<string, WalletStandardFeature>;
  accounts: WalletStandardAccount[];
}

interface WalletStandardRegistry {
  get: () => WalletStandard[];
}

declare global {
  interface Navigator {
    wallets?: WalletStandardRegistry;
  }
}

interface Props {
  onConnect: (address: string) => void;
  address?: string;
}

function getSuiWallets(): WalletStandard[] {
  const registry = window.navigator?.wallets;
  if (registry) {
    return registry.get().filter((w) => w.chains?.some((c) => c.startsWith("sui:")));
  }
  return [];
}

export function WalletConnect({ onConnect, address }: Props) {
  const [connecting, setConnecting] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualAddress, setManualAddress] = useState("");

  async function connect() {
    setConnecting(true);
    try {
      await new Promise((r) => setTimeout(r, 100));

      // Wallet Standard (Sui Wallet ≥ 0.2)
      const wallets = getSuiWallets();
      if (wallets.length > 0) {
        const wallet = wallets[0];
        const connectFeature = wallet.features["standard:connect"];
        if (connectFeature) {
          const result = await connectFeature.connect({ silent: false });
          const addr = result.accounts?.[0]?.address;
          if (addr) { onConnect(addr); localStorage.setItem("kissin_address", addr); return; }
        }
        if (wallet.accounts?.[0]?.address) {
          const addr = wallet.accounts[0].address;
          onConnect(addr); localStorage.setItem("kissin_address", addr); return;
        }
      }

      // Legacy window.suiWallet
      const legacyWallet = (window as Window & { suiWallet?: SuiWalletLegacy }).suiWallet;
      if (legacyWallet) {
        await legacyWallet.requestPermissions();
        const accounts = await legacyWallet.getAccounts();
        if (accounts[0]) { onConnect(accounts[0]); localStorage.setItem("kissin_address", accounts[0]); return; }
      }

      // Wallet not auto-detected — show manual entry
      setShowManual(true);
    } catch (err) {
      console.error("Wallet connect failed:", err);
      setShowManual(true);
    } finally {
      setConnecting(false);
    }
  }

  function submitManual() {
    const addr = manualAddress.trim();
    if (!addr.startsWith("0x") || addr.length < 20) {
      alert("Please enter a valid Sui address (starts with 0x)");
      return;
    }
    onConnect(addr);
    localStorage.setItem("kissin_address", addr);
    setShowManual(false);
  }

  if (address) {
    return (
      <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-full px-4 py-2">
        <div className="w-2 h-2 rounded-full bg-teal-400" />
        <span className="text-gray-300 text-xs font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      </div>
    );
  }

  if (showManual) {
    return (
      <div className="w-full space-y-2">
        <p className="text-gray-500 text-xs">Wallet not detected. Enter your Sui address manually:</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder="0x..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
          />
          <button
            onClick={submitManual}
            className="bg-teal-400 text-black font-bold px-4 py-2 rounded-xl text-xs hover:bg-teal-300 transition"
          >
            OK
          </button>
        </div>
        <button onClick={() => setShowManual(false)} className="text-gray-600 text-xs hover:text-gray-400">
          ← back
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={connecting}
      className="bg-teal-400 text-black font-bold px-6 py-2 rounded-full text-sm hover:bg-teal-300 transition disabled:opacity-50"
    >
      {connecting ? "Connecting..." : "Connect Sui Wallet"}
    </button>
  );
}
