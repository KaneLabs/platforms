"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster as OldToaster } from "sonner";
import { ModalProvider } from "@/components/modal/provider";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { mainnet, polygon, optimism, arbitrum } from "@wagmi/core/chains";
import { publicProvider } from "wagmi/providers/public";
import { Toaster } from "@/components/ui/toaster";

import { MetaMaskConnector } from "wagmi/connectors/metaMask";

// Configure chains & providers with the Alchemy provider.
// Two popular providers are Alchemy (alchemy.com) and Infura (infura.io)
const { chains, publicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [publicProvider()],
);

// Set up wagmi config
const config = createConfig({
  connectors: [
    new MetaMaskConnector({ chains }),
  ],
  publicClient,
});
const passportServerUrl = "https://api.pcd-passport.com";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <SessionProvider>
          <OldToaster position="top-right" className="dark:hidden" />
          <OldToaster
            position="top-right"
            theme="dark"
            className="hidden dark:block"
          />
          <Toaster />
          <ModalProvider>{children}</ModalProvider>
      </SessionProvider>
    </WagmiConfig>
  );
}
