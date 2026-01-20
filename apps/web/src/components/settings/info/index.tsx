import { H3 } from "@/components/typography";
import VersionInfo from "./version-info";

export const InfoSection = () => {
  return (
    <section className="container px-4 py-2">
      <div className="flex flex-col gap-4">
        <H3 className="space-y-4">App Info</H3>
        <VersionInfo />
      </div>
    </section>
  );
};
