import { Suspense } from "react";
import { ResetPassword } from "@/components/reset-password";

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
