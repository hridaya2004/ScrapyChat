import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPassword } from "@/components/reset-password";

export const metadata: Metadata = {
  description: "Reset your ScrapyChat account password.",
  robots: {
    follow: false,
    index: false,
  },
  title: "Reset Password",
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
