import React from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { Header } from '../components/layout/Header';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <div className="min-h-screen pb-[env(safe-area-inset-bottom)] flex flex-col">
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
    </>
  );
}

export default MyApp; 