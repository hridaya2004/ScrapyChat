import "./globals.css";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import type { Metadata } from "next";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import { globalMetadata } from "@/config/metadata";
import { geistMono, geistSans } from "@/lib/geist";
import { AuthJWTProvider } from "@/providers/auth-jwt-provider";
import { DialogProvider } from "@/providers/dialog-context-provider";
import { ModelContextProvider } from "@/providers/model-provider";
import { QueryPromptUrlProvider } from "@/providers/query-prompt-url-provider";
import { QueryClientWrapper } from "@/providers/query-provider";
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
      <head>
        <link
          href="/favicon-96x96.png"
          rel="icon"
          sizes="96x96"
          type="image/png"
        />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <link href="/favicon.ico" rel="shortcut icon" />
        <link
          href="/apple-touch-icon.png"
          rel="apple-touch-icon"
          sizes="180x180"
        />
        <meta content="ScrapyChat" name="apple-mobile-web-app-title" />
        <link href="/site.webmanifest" rel="manifest" />
      </head>
      <GoogleTagManager gtmId="GTM-N8J7XBGV" />
      <GoogleAnalytics gaId="G-57KPX2KXVZ" />
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <ThemeProvider>
          <AuthJWTProvider>
            <QueryClientWrapper>
              <QueryPromptUrlProvider>
                <ModelContextProvider>
                  <DialogProvider>
                    <main className="container-wrapper flex h-full flex-col">
                      <Header />
                      <div className="flex-1 overflow-y-auto">{children}</div>
                    </main>
                    <Toaster />
                  </DialogProvider>
                </ModelContextProvider>
              </QueryPromptUrlProvider>
            </QueryClientWrapper>
          </AuthJWTProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
