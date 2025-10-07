import Link from "next/link";
import { ModeSwitcher } from "../mode-switcher";
import { H3 } from "../typography";
import UserToggle from "./user-toggle";

export default function Header() {
  return (
    <header className="py-4 flex justify-between items-center">
      <Link href={"/"}>
        <H3>ScrapyChat</H3>
      </Link>
      <div className="flex flex-row items-center gap-2">
        <UserToggle />
        <ModeSwitcher />
      </div>
    </header>
  );
}
