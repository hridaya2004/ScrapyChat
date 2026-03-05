import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPassword } from "@/components/reset-password";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your ScrapyChat account password.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <Suspense>
      <ResetPassword data={params} />
    </Suspense>
  );
}
