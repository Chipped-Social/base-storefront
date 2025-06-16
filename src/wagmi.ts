import { http, cookieStorage, createConfig, createStorage } from "wagmi";
import { baseSepolia, base } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";
import { type Transport } from "wagmi";

export function getConfig() {
  // Get chain ID from environment variables
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID 
    ? parseInt(process.env.NEXT_PUBLIC_CHAIN_ID) 
    : 84532; // Default to Base Sepolia if not specified
  
  // Determine if we're in development based on chain ID
  const isDevelopment = chainId === 84532; // Base Sepolia
  
  // Select the appropriate chain
  const chain = isDevelopment ? baseSepolia : base;
  
  // Configure the appropriate Coinbase wallet connector
  const cbWalletConnector = coinbaseWallet({
    appName: "Chipped Social",
    preference: isDevelopment 
      ? {
          keysUrl: "https://keys-dev.coinbase.com/connect",
          options: "smartWalletOnly",
        }
      : "smartWalletOnly"
  });

  // Use a more explicit type assertion for the transports
  const transports = {} as Record<number, Transport>;
  transports[chain.id] = http();

  return createConfig({
    chains: [chain],
    connectors: [cbWalletConnector],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports,
  });
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
