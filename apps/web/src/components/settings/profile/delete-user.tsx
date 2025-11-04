"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";

const deleteUserFormSchema = z.object({
  password: z.string().min(8).max(100),
  token: z.string(),
});

export default function DeleteUser() {
  const { data } = authClient.useSession();

  const router = useRouter();

  const deleteUserForm = useForm<z.infer<typeof deleteUserFormSchema>>({
    resolver: zodResolver(deleteUserFormSchema),
    defaultValues: {
      password: "",
      token: data?.session.token,
    },
  });

  const onDelete = async (values: z.infer<typeof deleteUserFormSchema>) => {
    await authClient.deleteUser({
      callbackURL: "/auth",
      password: values.password,
    });
    router.refresh();
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <Form {...deleteUserForm}>
      <form onSubmit={deleteUserForm.handleSubmit(onDelete)}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Delete account</FieldLegend>

            <FieldDescription>
              This action is irreversible. Please enter your current password to
              confirm.
            </FieldDescription>
            <FormField
              control={deleteUserForm.control}
              name="password"
              render={({ field }) => (
                <FormItem className="w-fit">
                  <FormControl>
                    <InputGroup className="rounded-3xl">
                      <InputGroupInput
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="rounded-3xl"
                        {...field}
                      />

                      <InputGroupAddon align="inline-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InputGroupButton
                              className="rounded-full"
                              size="icon-xs"
                              onClick={() => setShowPassword((prev) => !prev)}
                            >
                              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </InputGroupButton>
                          </TooltipTrigger>
                          <TooltipContent>
                            {showPassword ? "Hide password" : "Show password"}
                          </TooltipContent>
                        </Tooltip>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Field className="w-fit">
              <Button className="rounded-3xl" variant="destructive">
                Delete
              </Button>
            </Field>
          </FieldSet>
        </FieldGroup>
      </form>
    </Form>
  );
}
