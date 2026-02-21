import { authClient } from "@/lib/auth-client";
import { Muted } from "./typography";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Spinner } from "./ui/spinner";

interface VerifyEmailDialogProps {
  onOpenChange: (open: boolean) => void;
  openDialog: boolean;
}

export default function VerifyEmailDialog({
  openDialog,
  onOpenChange,
}: VerifyEmailDialogProps) {
  const { data } = authClient.useSession();

  return (
    <AlertDialog onOpenChange={onOpenChange} open={openDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Verify your email address</AlertDialogTitle>
          <AlertDialogDescription>
            Link to verify your account has been sent to your email address{" "}
            <span>{data?.user.email}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Muted>
          You'll be automatically redirected to home screen after your email is
          verified.
        </Muted>
        <Spinner />
      </AlertDialogContent>
    </AlertDialog>
  );
}
