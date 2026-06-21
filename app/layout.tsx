import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";

const mono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KISSIN — Keep It Simple or I'll go INSane",
  description: "AI news signal detector powered by Walrus + Sui",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${mono.className} bg-black text-white min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
