import Link from "next/link";
import { ModeSwitcher } from "../mode-switcher";
import { H3 } from "../typography";
import UserToggle from "./user-toggle";

export default function Header() {
  return (
    <header className="flex max-h-app-header items-center justify-between py-4">
      <Link className="flex items-center gap-2" href={"/"}>
        {/** biome-ignore lint/performance/noImgElement: Ignore */}
        <img
          alt="ScrapyChat Logo"
          className="dark:invert"
          height={32}
          src="/logo.svg"
          width={32}
        />
        <H3>ScrapyChat</H3>
      </Link>
      <div className="flex flex-row items-center gap-2">
        <ModeSwitcher />
        <UserToggle />
      </div>
    </header>
  );
}
