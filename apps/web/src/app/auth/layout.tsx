import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Sign in or create an account to start scraping websites and chatting with their content.",
  openGraph: {
    description:
      "Sign in or create an account to start scraping websites and chatting with their content.",
    title: "Sign In | ScrapyChat",
  },
  title: "Sign In",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
