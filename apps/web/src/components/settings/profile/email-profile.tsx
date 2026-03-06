import { H4 } from "@/components/typography";
import { FieldSeparator } from "@/components/ui/field";
import ChangeEmail from "./change-email";
import ChangePassword from "./change-password";
import ChangeUserDetails from "./change-user-details";
import DeleteUser from "./delete-user";

export default function EmailProfile() {
  return (
    <section className="container px-4 py-2">
      <div className="flex flex-col gap-3">
        <H4>Profile</H4>
        <div className="flex flex-col gap-8">
          <ChangeUserDetails />
          <FieldSeparator />
          <ChangeEmail />
          <FieldSeparator />
          <ChangePassword />
          <FieldSeparator />
          <DeleteUser oauth={false} />
        </div>
      </div>
    </section>
  );
}
