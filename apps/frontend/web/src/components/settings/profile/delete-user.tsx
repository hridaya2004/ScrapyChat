"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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

const MINIMUM_PASSWORD_LENGTH = 8;
const MAXIMUM_PASSWORD_LENGTH = 100;

const getSchema = (oauth: boolean) =>
  z.object({
    password: oauth
      ? z.string().optional()
      : z
          .string()
          .min(
            MINIMUM_PASSWORD_LENGTH,
            "Password must be at least 8 characters"
          )
          .max(MAXIMUM_PASSWORD_LENGTH),
  });

export default function DeleteUser({ oauth = false }: { oauth: boolean }) {
  const [showPassword, setShowPassword] = useState(false);

  const schema = getSchema(oauth);
  const deleteUserForm = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
    },
  });

  const onDelete = async (values: z.infer<typeof schema>) => {
    const { data } = await authClient.token();

    try {
      toast.loading("Deleting account...", {
        id: "delete-account",
      });
      const response = await authClient.deleteUser({
        callbackURL: "/auth",
        ...(!oauth && { password: values.password }),
        fetchOptions: {
          auth: {
            type: "Bearer",
            token: data?.token,
          },
        },
      });

      if (response.data?.success) {
        toast.success(
          "Delete verification email has been sent to your account.",
          {
            id: "delete-account",
          }
        );
      }
    } catch {
      toast.error("Failed to delete user account.");
    }
  };

  return (
    <Form {...deleteUserForm}>
      <form onSubmit={deleteUserForm.handleSubmit(onDelete)}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Delete account</FieldLegend>
            {!oauth && (
              <>
                <FieldDescription>
                  This action is irreversible. Please enter your current
                  password to confirm.
                </FieldDescription>
                <FormField
                  control={deleteUserForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="w-fit">
                      <FormControl>
                        <InputGroup className="rounded-3xl">
                          <InputGroupInput
                            className="rounded-3xl"
                            placeholder="Password"
                            type={showPassword ? "text" : "password"}
                            {...field}
                          />

                          <InputGroupAddon align="inline-end">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InputGroupButton
                                  className="rounded-full"
                                  onClick={() =>
                                    setShowPassword((prev) => !prev)
                                  }
                                  size="icon-xs"
                                >
                                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </InputGroupButton>
                              </TooltipTrigger>
                              <TooltipContent>
                                {showPassword
                                  ? "Hide password"
                                  : "Show password"}
                              </TooltipContent>
                            </Tooltip>
                          </InputGroupAddon>
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            {oauth && (
              <FieldDescription>
                This action is irreversible. Verification mail will be sent for
                confirmation.
              </FieldDescription>
            )}
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
