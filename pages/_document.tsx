import { Html, Head, Main, NextScript } from 'next/document';
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function Document() {
  return (
    <Html lang="pl">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <meta name="google-site-verification" content="IBFJq-uNh-c6-ekw-kkNzUqEY7MY_lHT-J6mDKzyHrQ" />

          <meta name="keywords" content="Robert Makłowicz, mapa restauracji, atrakcje turystyczne, Makło, Dalmacja" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body>
            <Main />
            <NextScript />
            <SpeedInsights/>
        </body>
    </Html>
  );
}