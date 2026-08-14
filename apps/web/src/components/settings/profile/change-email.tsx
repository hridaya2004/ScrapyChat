import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Muted } from "@/components/typography";
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
  FormMessage,
} from "../../ui/form";

const changeEmailSchema = z.object({
  newEmail: z.email(),
});

export default function ChangeEmail() {
  const emailForm = useForm<z.infer<typeof changeEmailSchema>>({
    defaultValues: {
      newEmail: "",
    },
    resolver: zodResolver(changeEmailSchema),
  });

  const onSubmit = (_values: z.infer<typeof changeEmailSchema>) => {
    // TODO: Implement email change functionality
    // authClient.changeEmail({ newEmail: _values.newEmail });
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
              <div className="inline-flex items-center gap-2">
                <Muted>{data?.user.email as string}</Muted>
                {!!data?.user.emailVerified && (
                  <div className="inline-flex items-center gap-1">
                    <CheckIcon className="text-green-600" />
                    <Muted className="font-medium text-green-600">
                      Verified
                    </Muted>
                  </div>
                )}
              </div>
            </Field>
            <FormField
              control={emailForm.control}
              name="newEmail"
              // biome-ignore lint/performance/noJsxPropsBind: standard react-hook-form pattern
              render={({ field }) => (
                <FormItem className="w-fit">
                  <FormControl>
                    <Input
                      className="rounded-3xl"
                      placeholder="New email address"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Field className="w-fit">
              <Button className="rounded-3xl">Change email</Button>
            </Field>
          </FieldSet>
        </FieldGroup>
      </form>
    </Form>
  );
}
