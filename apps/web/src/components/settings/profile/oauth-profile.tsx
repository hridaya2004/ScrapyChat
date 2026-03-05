import { H4 } from "@/components/typography";
import { FieldSeparator } from "@/components/ui/field";
import ChangeUserDetails from "./change-user-details";
import DeleteUser from "./delete-user";

export default function OAuthProfile() {
  return (
    <div className="container px-4 py-2">
      <H4>Profile</H4>
      <div className="mt-4 flex flex-col gap-8">
        <ChangeUserDetails />
        <FieldSeparator />
        <DeleteUser oauth />
      </div>
    </div>
  );
}
