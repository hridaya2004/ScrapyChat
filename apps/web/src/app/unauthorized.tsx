import Link from "next/link";
import { H1, H2, Lead } from "@/components/typography";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <H1 className="font-mono">401</H1>
        <H2>Unauthorized</H2>
      </div>
      <Lead>Please log in to access this page.</Lead>
      <Link href="/auth">
        <Button className="rounded-3xl" size="lg">
          Login
        </Button>
      </Link>
    </div>
  );
}
