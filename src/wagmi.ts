import { http, cookieStorage, createConfig, createStorage } from "wagmi";
import { baseSepolia, base } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

const cbWalletConnector = coinbaseWallet({
  appName: "Chipped Social",
  preference: {
    keysUrl: "https://keys-dev.coinbase.com/connect",
    options: "smartWalletOnly",
  },
});

export function getConfig() {
  return createConfig({
    chains: [baseSepolia],
    connectors: [cbWalletConnector],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [baseSepolia.id]: http(),
    },
  });
}

// const cbWalletConnector = coinbaseWallet({
//   appName: "Chipped Social",
//   preference: "smartWalletOnly",
// });

// export function getConfig() {
//   return createConfig({
//     chains: [base],
//     connectors: [cbWalletConnector],
//     storage: createStorage({
//       storage: cookieStorage,
//     }),
//     ssr: true,
//     transports: {
//       [base.id]: http(),
//     },
//   });
// }


declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
