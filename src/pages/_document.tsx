import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        <link rel="alternate" type="text/markdown" href="https://loakinaja.com/index.md" />
        <link rel="describedby" type="text/plain" href="https://loakinaja.com/llms.txt" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
