import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { AuthProvider } from "@/context/AuthContext";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith("/admin");

  return (
    <AuthProvider>
      {isAdminRoute ? (
        <>
          <SEO />
          <Component {...pageProps} />
        </>
      ) : (
        <Layout>
          <SEO />
          <Component {...pageProps} />
        </Layout>
      )}
    </AuthProvider>
  );
}
