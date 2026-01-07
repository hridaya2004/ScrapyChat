import "./globals.css";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import type { Metadata } from "next";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import { globalMetadata } from "@/config/metadata";
import { geistMono, geistSans } from "@/lib/geist";
import { AuthJWTProvider } from "@/providers/auth-jwt-provider";
import { ModelContextProvider } from "@/providers/model-provider";
import { QueryPromptUrlProvider } from "@/providers/query-prompt-url-provider";
import QueryClientWrapper from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

export const metadata: Metadata = {
  ...globalMetadata,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
      <GoogleTagManager gtmId="GTM-N8J7XBGV" />
      <GoogleAnalytics gaId="G-57KPX2KXVZ" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthJWTProvider>
            <QueryClientWrapper>
              <QueryPromptUrlProvider>
                <ModelContextProvider>
                  <main className="container-wrapper flex h-full flex-col">
                    <Header />
                    {children}
                  </main>
                  <Toaster />
                </ModelContextProvider>
              </QueryPromptUrlProvider>
            </QueryClientWrapper>
          </AuthJWTProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
