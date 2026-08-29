import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { AuthProvider } from "@/context/AuthContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Layout>
        <SEO />
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
