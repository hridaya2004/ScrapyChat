import { H4 } from "@/components/typography";
import { FieldSeparator } from "@/components/ui/field";
import ChangeUserDetails from "./change-user-details";
import DeleteUser from "./delete-user";

export default function OAuthProfile() {
  return (
    <section className="container px-4 py-2">
      <div className="flex flex-col gap-3">
        <H4>Profile</H4>
        <div className="flex flex-col gap-8">
          <ChangeUserDetails />
          <FieldSeparator />
          <DeleteUser oauth />
        </div>
      </div>
    </section>
  );
}
