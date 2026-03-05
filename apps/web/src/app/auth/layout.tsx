import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in or create an account to start scraping websites and chatting with their content.",
  openGraph: {
    title: "Sign In | ScrapyChat",
    description:
      "Sign in or create an account to start scraping websites and chatting with their content.",
  },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
