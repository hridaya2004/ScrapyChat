import Link from "next/link";
import { H1, H2, Lead } from "@/components/typography";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col justify-center gap-4 text-center">
      <div className="flex flex-col items-center gap-2">
        <H1 className="font-mono">404</H1>
        <H2 className="text-3xl">Not Found</H2>
      </div>
      <Lead>The page you are looking for does not exist.</Lead>
      <Link className="mx-auto" href="/">
        <Button className="rounded-3xl" size="lg">
          Go back home
        </Button>
      </Link>
    </div>
  );
}
