"use client";

import Link from "next/link";
import { useAuthJWTProvider } from "@/providers/auth-jwt-provider";
import { ModeSwitcher } from "../mode-switcher";
import ScrapeList from "../scrape/scrape-list";
import ScrapeNew from "../scrape/scrape-new";
import { H3 } from "../typography";
import UserToggle from "./user-toggle";

export default function Header() {
  const { token } = useAuthJWTProvider();

  return (
    <header className="flex max-h-app-header items-center justify-between py-4">
      <Link href={"/"}>
        <H3>ScrapyChat</H3>
      </Link>
      <div className="flex flex-row items-center gap-2">
        {token && (
          <>
            <ScrapeNew />
            <ScrapeList />
          </>
        )}
        <ModeSwitcher />
        <UserToggle />
      </div>
    </header>
  );
}
