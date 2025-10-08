import { H3 } from "@/components/typography";
import { FieldSeparator } from "@/components/ui/field";
import ChangeEmail from "./change-email";
import ChangePassword from "./change-password";
import ChangeUserDetails from "./change-user-details";
import DeleteUser from "./delete-user";

export default function ProfileSettings() {
  return (
    <div className="container py-2 px-4">
      <H3>Profile</H3>
      <div className="flex flex-col gap-8 py-2">
        <ChangeUserDetails />
        <FieldSeparator />
        <ChangeEmail />
        <FieldSeparator />
        <ChangePassword />
        <FieldSeparator />
        <DeleteUser />
      </div>
    </div>
  );
}
