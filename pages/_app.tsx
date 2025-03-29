import React from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { Header } from '../components/layout/Header';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Śladami Roberta Makłowicza</title>
        <meta name="description" content="Interaktywna mapa restauracji i atrakcji odwiedzonych przez Roberta Makłowicza." />
        <meta name="google-site-verification" content="IBFJq-uNh-c6-ekw-kkNzUqEY7MY_lHT-J6mDKzyHrQ" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sladami-roberta.vercel.app" />
        <meta property="og:title" content="Śladami Roberta Makłowicza" />
        <meta property="og:description" content="Interaktywna mapa restauracji i atrakcji odwiedzonych przez Roberta Makłowicza." />
        <meta property="og:image" content="/og-image.png" />

        {/*  Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://sladami-roberta.vercel.app" />
        <meta property="twitter:title" content="Śladami Roberta Makłowicza" />
        <meta property="twitter:description" content="Interaktywna mapa restauracji i atrakcji odwiedzonych przez Roberta Makłowicza." />
        <meta property="twitter:image" content="/og-image.png" />

        <meta name="keywords" content="Robert Makłowicz, mapa restauracji, atrakcje turystyczne, Makło, Dalmacja" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen pb-[env(safe-area-inset-bottom)] flex flex-col">
        <Header />
        <Component {...pageProps} className="flex-1" />
      </div>
    </>
  );
}

export default MyApp; 