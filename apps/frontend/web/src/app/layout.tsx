import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/global";
import { geistMono, geistSans } from "@/lib/geist";
import { AuthJWTProvider } from "@/providers/auth-jwt-provider";
import { QueryPromptUrlProvider } from "@/providers/query-prompt-url-provider";
import QueryClientWrapper from "@/providers/query-provider";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthJWTProvider>
            <QueryClientWrapper>
              <QueryPromptUrlProvider>
                <main className="container-wrapper flex h-full flex-col">
                  <Header />
                  {children}
                </main>
                <Toaster />
              </QueryPromptUrlProvider>
            </QueryClientWrapper>
          </AuthJWTProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
