import { H4 } from "@/components/typography";
import VersionInfo from "./version-info";

export const InfoSection = () => {
  return (
    <section className="container px-4 py-2">
      <div className="flex flex-col gap-6">
        <H4>App Info</H4>
        <VersionInfo />
      </div>
    </section>
  );
};
