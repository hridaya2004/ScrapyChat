import { H3 } from "@/components/typography";
import { FieldSeparator } from "@/components/ui/field";
import ChangeUserDetails from "./change-user-details";
import DeleteUser from "./delete-user";

export default function OAuthProfile() {
  return (
    <div className="container px-4 py-2">
      <H3>Profile</H3>
      <div className="flex flex-col gap-8 py-2">
        <ChangeUserDetails />
        <FieldSeparator />
        <DeleteUser oauth />
      </div>
    </div>
  );
}
