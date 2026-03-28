import { Html, Head, Main, NextScript } from 'next/document';
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function Document() {
  return (
    <Html lang="pl">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <meta name="theme-color" content="#f8f5f0" />
          <meta name="google-site-verification" content="IBFJq-uNh-c6-ekw-kkNzUqEY7MY_lHT-J6mDKzyHrQ" />

          <meta name="keywords" content="Robert Makłowicz, mapa restauracji, atrakcje turystyczne, Makło, Dalmacja" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Reenie+Beanie&family=Work+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        </Head>
        <body>
            <Main />
            <NextScript />
            <SpeedInsights/>
        </body>
    </Html>
  );
}