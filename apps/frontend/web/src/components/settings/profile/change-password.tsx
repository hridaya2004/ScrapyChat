"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "../../ui/field";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../../ui/input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";

const MINIMUM_PASSWORD_LENGTH = 8;
const MAXMIMUM_PASSWORD_LENGTH = 100;
const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{}[\]|;:'",.<>/?]).{8,}$/;

const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(MINIMUM_PASSWORD_LENGTH)
    .max(MAXMIMUM_PASSWORD_LENGTH),
  newPassword: z
    .string()
    .min(MINIMUM_PASSWORD_LENGTH, "Password must be at least 8 characters long")
    .max(MAXMIMUM_PASSWORD_LENGTH)
    .regex(STRONG_PASSWORD_REGEX, "Invalid new password"),
  revokeOtherSessions: z.boolean(),
});

export default function ChangePassword() {
  const passwordForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      revokeOtherSessions: false,
    },
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const onSubmit = async (values: z.infer<typeof changePasswordSchema>) => {
    try {
      const { data, error } = await authClient.changePassword({
        ...values,
      });

      if (error) {
        if (error.code === "INVALID_PASSWORD") {
          toast({
            title: "Invalid current password",
            description: "Please enter your current password correctly.",
            status: "error",
          });
        } else {
          toast({
            title: "Failed to change password",
            description: "Please try again later.",
            status: "error",
          });
        }
      }

      if (data) {
        toast({
          title: "Password changed successfully",
          description: "Your password has been updated.",
          status: "success",
        });
      }
    } catch {
      toast({
        title: "Failed to change password",
        description: "Please try again later.",
        status: "error",
      });
    }
  };

  return (
    <Form {...passwordForm}>
      <form onSubmit={passwordForm.handleSubmit(onSubmit)}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Change password</FieldLegend>

            <FieldDescription>
              You can change your password here. Please enter your current
              password and a new password.
            </FieldDescription>
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem className="w-fit">
                  <FormControl>
                    <InputGroup className="rounded-3xl">
                      <InputGroupInput
                        className="rounded-3xl"
                        placeholder="Old password"
                        type={showCurrentPassword ? "text" : "password"}
                        {...field}
                      />

                      <InputGroupAddon align="inline-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InputGroupButton
                              className="rounded-full"
                              onClick={() =>
                                setShowCurrentPassword((prev) => !prev)
                              }
                              size="icon-xs"
                            >
                              {showCurrentPassword ? (
                                <EyeOffIcon />
                              ) : (
                                <EyeIcon />
                              )}
                            </InputGroupButton>
                          </TooltipTrigger>
                          <TooltipContent>
                            {showCurrentPassword
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
            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="w-fit">
                  <FormControl>
                    <InputGroup className="w-fit rounded-3xl">
                      <InputGroupInput
                        className="rounded-3xl"
                        placeholder="New password"
                        type={showNewPassword ? "text" : "password"}
                        {...field}
                      />

                      <InputGroupAddon align="inline-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InputGroupButton
                              className="rounded-full"
                              onClick={() =>
                                setShowNewPassword((prev) => !prev)
                              }
                              size="icon-xs"
                            >
                              {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </InputGroupButton>
                          </TooltipTrigger>
                          <TooltipContent>
                            {showNewPassword
                              ? "Hide password"
                              : "Show password"}
                          </TooltipContent>
                        </Tooltip>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormControl>
                  <FormDescription className="text-balance">
                    Should contain at least 8 characters, including at least one
                    uppercase letter, lowercase letter, number, and special
                    character.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="revokeOtherSessions"
              render={({ field }) => (
                <FormItem className="flex w-fit flex-row-reverse items-center gap-2">
                  <FormLabel>Revoke other sessions</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Field className="w-fit">
              <Button className="rounded-3xl" size="sm">
                Change password
              </Button>
            </Field>
          </FieldSet>
        </FieldGroup>
      </form>
    </Form>
  );
}
