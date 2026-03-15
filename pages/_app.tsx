import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { Header } from '../components/layout/Header';
import Head from 'next/head';
import { Analytics } from '@vercel/analytics/next';
import posthog from 'posthog-js';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
      capture_exceptions: true,
      loaded: (ph) => {
        if (process.env.NODE_ENV === 'development') ph.opt_out_capturing();
        if (typeof window !== 'undefined' &&
            localStorage.getItem('analyticsOptOut') === 'true') {
          ph.opt_out_capturing();
        }
      },
    });
  }, []);

  return (
    <>
      <div className="h-full flex flex-col">
        <Head>
          <title>Śladami Roberta Makłowicza</title>
          <meta name="description" content="Interaktywna mapa restauracji i atrakcji odwiedzonych przez Roberta Makłowicza."/>

          <meta property="og:url" content="https://www.sladami-roberta.pl"/>
          <meta property="og:type" content="website"/>
          <meta property="og:title" content="Śladami Roberta Makłowicza"/>
          <meta property="og:description" content="Interaktywna mapa restauracji i atrakcji odwiedzonych przez Roberta Makłowicza."/>
          <meta property="og:image" content="https://sladami-roberta.pl/og-image.png"/>

          <meta name="twitter:card" content="summary_large_image"/>
          <meta property="twitter:domain" content="sladami-roberta.pl"/>
          <meta property="twitter:url" content="https://www.sladami-roberta.pl"/>
          <meta name="twitter:title" content="Śladami Roberta Makłowicza"/>
          <meta name="twitter:description" content="Interaktywna mapa restauracji i atrakcji odwiedzonych przez Roberta Makłowicza."/>
          <meta name="twitter:image" content="https://sladami-roberta.pl/og-image.png"/>
        </Head>
        <Header />
        <Component {...pageProps} className="flex-1" />
      </div>
      <Analytics />
    </>
  );
}

export default MyApp; 