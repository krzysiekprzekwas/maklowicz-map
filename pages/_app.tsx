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