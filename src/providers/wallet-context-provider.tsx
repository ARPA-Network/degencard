"use client";

/**
 * This is a React functional component that provides a context for Solana wallets.
 * It uses various hooks and components from the @solana/wallet-adapter-react and @solana/wallet-adapter-react-ui libraries.
 *
 * Props:
 * - children: ReactNode - The child components that will have access to the wallet context.
 *
 * State:
 * - network: WalletAdapterNetwork - The network to connect to, in this case, it's set to Devnet.
 * - autoConnect: boolean - A value from the useWallet hook that indicates whether to automatically connect to the wallet.
 * - endpoint: string - The RPC endpoint for the network, obtained using the clusterApiUrl function with the network as an argument.
 * - wallets: Wallet[] - An array of wallet adapters that the user can choose from.
 *
 * Returns:
 * - A ConnectionProvider component that provides the RPC connection context.
 * - A WalletProvider component that provides the wallet context, with the wallets and autoConnect props.
 * - A WalletModalProvider component that provides the context for a modal that allows the user to select and connect to a wallet.
 *
 * The child components passed to this component will have access to these contexts and can use them to interact with the user's Solana wallet.
 */

import { FC, ReactNode, useCallback, useMemo } from "react";
// import dynamic from "next/dynamic";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter,
  LedgerWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletConnectWalletAdapter } from '@walletconnect/solana-adapter'
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
import dynamic from "next/dynamic";

require("@solana/wallet-adapter-react-ui/styles.css");

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

export const WalletButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const network = WalletAdapterNetwork.Mainnet;

  //wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new WalletConnectWalletAdapter({
        network,
        options: {
          projectId,
        },
      }),
    ],
    [network]
  );

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
