import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Head from "next/head";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Gym Tracker</title>

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        <meta
          name="description"
          content="Workout and program tracking app"
        />

        <meta name="theme-color" content="#111827" />

        <meta
          name="apple-mobile-web-app-capable"
          content="yes"
        />

        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        <link rel="manifest" href="/manifest.json" />

        <link
          rel="apple-touch-icon"
          href="/icons/flexed_biceps_3d_default.png"
        />

        <link
          rel="icon"
          type="image/png"
          href="/icons/flexed_biceps_3d_default.png"
        />
      </Head>

      <SpeedInsights />

      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);