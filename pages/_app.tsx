import React from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import Analytics from '../components/GoogleAnalytics';

// Get the Google Analytics ID from environment variables
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      {GA_MEASUREMENT_ID && <Analytics gaId={GA_MEASUREMENT_ID} />}
    </>
  );
}

export default MyApp; 