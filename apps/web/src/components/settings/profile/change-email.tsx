import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../../ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { P } from "@/components/typography";

const changeEmailSchema = z.object({
  newEmail: z.email(),
});

export default function ChangeEmail() {
  const emailForm = useForm<z.infer<typeof changeEmailSchema>>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: "",
    },
  });

  const onSubmit = (values: z.infer<typeof changeEmailSchema>) => {
    console.log(values);
  };

  const { data } = authClient.useSession();

  return (
    <Form {...emailForm}>
      <form onSubmit={emailForm.handleSubmit(onSubmit)}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Change email address</FieldLegend>
            <FieldDescription>
              Enter your new email address to change your email.
            </FieldDescription>
            <Field className="gap-2">
              <FieldLabel>Linked email address</FieldLabel>
              <div className="inline-flex gap-2 items-center">
                <P className="text-sm">{data?.user.email as string}</P>
                {data?.user.emailVerified && (
                  <div className="inline-flex gap-1 items-center">
                    <CheckIcon className="text-green-600" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                )}
              </div>
            </Field>
            <FormField
              control={emailForm.control}
              name="newEmail"
              render={({ field }) => (
                <FormItem className="w-fit">
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="New email address"
                      className="rounded-3xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Field className="w-fit">
              <Button className="rounded-3xl" size="sm">
                Change email
              </Button>
            </Field>
          </FieldSet>
        </FieldGroup>
      </form>
    </Form>
  );
}
