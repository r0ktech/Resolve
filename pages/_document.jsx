import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className="h-full bg-surface-50">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <meta name="description" content="Resolve - Turn customer questions into resolved conversations with AI customer support." />
      </Head>
      <body className="h-full bg-surface-50 text-surface-900 font-sans antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
