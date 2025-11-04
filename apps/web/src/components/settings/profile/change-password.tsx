"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

const changePasswordSchema = z.object({
  currentPassword: z.string().min(2).max(100),
  newPassword: z.string().min(2).max(100),
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
      const { data } = await authClient.changePassword({
        ...values,
      });
      if (data) {
        toast.success("Password changed successfully");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to change password");
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
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Old password"
                        className="rounded-3xl"
                        {...field}
                      />

                      <InputGroupAddon align="inline-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InputGroupButton
                              className="rounded-full"
                              size="icon-xs"
                              onClick={() =>
                                setShowCurrentPassword((prev) => !prev)
                              }
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
                    <InputGroup className="rounded-3xl">
                      <InputGroupInput
                        type={showNewPassword ? "text" : "password"}
                        placeholder="New password"
                        className="rounded-3xl"
                        {...field}
                      />

                      <InputGroupAddon align="inline-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InputGroupButton
                              className="rounded-full"
                              size="icon-xs"
                              onClick={() =>
                                setShowNewPassword((prev) => !prev)
                              }
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="revokeOtherSessions"
              render={({ field }) => (
                <FormItem className="w-fit flex flex-row-reverse gap-1 items-center">
                  <FormLabel>Revoke other sessions</FormLabel>
                  <FormControl>
                    <Checkbox
                      onCheckedChange={field.onChange}
                      checked={field.value}
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
