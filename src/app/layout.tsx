import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ReactNode, useEffect } from "react";
import "./globals.css";
import WalletContextProvider from "@/providers/wallet-context-provider";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import Debug from "@/components/Debug";
import { GoogleAnalytics } from "@next/third-parties/google";
import { isProd } from "@/utils/constants";


type Props = {
  children: ReactNode;
};

export default async function LocaleLayout({ children }: Props) {
  const locale = await getLocale();

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <title>Degen Card</title>
      </head>
      <body>
        <WalletContextProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </WalletContextProvider>
      </body>
      {!isProd && <Debug />}
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || "" }/>
    </html>
  );
}
