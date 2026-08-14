"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  MAXMIMUM_PASSWORD_LENGTH,
  MINIMUM_PASSWORD_LENGTH,
  STRONG_PASSWORD_REGEX,
} from "@/components/auth/register";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
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
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

const resetFormSchema = z.object({
  newPassword: z
    .string({
      error: "Password is required",
    })
    .min(MINIMUM_PASSWORD_LENGTH, {
      error: "Password must be between 8 and 100 characters",
    })
    .max(MAXMIMUM_PASSWORD_LENGTH, {
      error: "Password must be between 8 and 100 characters",
    })
    .regex(STRONG_PASSWORD_REGEX, {
      error:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }),
  token: z.string(),
});
export default function ResetPass({ token }: { token: string }) {
  // only resetForm if token is there
  const resetForm = useForm<z.infer<typeof resetFormSchema>>({
    defaultValues: {
      newPassword: "",
      token,
    },
    resolver: zodResolver(resetFormSchema),
  });

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePassword = useCallback(() => setShowPassword((v) => !v), []);

  const onReset = async (resetData: z.infer<typeof resetFormSchema>) => {
    setLoading(true);
    try {
      const { data, error } = await authClient.resetPassword({
        newPassword: resetData.newPassword,
        token: resetData.token,
      });

      if (error) {
        toast({
          description: error.message,
          title: "Failed to update the password",
        });
        return;
      }

      if (data) {
        router.push("/auth");
        router.refresh();
      }
    } catch {
      toast({
        description: "Failed in sending updated password",
        title: "Failed to update password",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Card className="w-full max-w-sm gap-4 rounded-3xl p-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl tracking-tight">
            Reset your password
          </CardTitle>
          <CardDescription>Enter new password for your account</CardDescription>
        </div>
        <Form {...resetForm}>
          <form
            className="flex flex-col gap-2"
            onSubmit={resetForm.handleSubmit(onReset)}
          >
            <FormField
              control={resetForm.control}
              name="newPassword"
              // biome-ignore lint/performance/noJsxPropsBind: standard react-hook-form pattern
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputGroup className="rounded-3xl">
                      <InputGroupInput
                        placeholder="New password"
                        type={showPassword ? "text" : "password"}
                        {...field}
                      />
                      <InputGroupAddon align="inline-end">
                        <button
                          className="pe-2 hover:cursor-pointer"
                          onClick={togglePassword}
                          type="button"
                        >
                          {showPassword ? (
                            <EyeOffIcon className="size-4" />
                          ) : (
                            <EyeIcon className="size-4" />
                          )}
                        </button>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="mt-2 rounded-full"
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <Spinner className="bg-primary-foreground" size="size-4" />
              ) : null}
              {loading ? "Resetting your password" : "Reset your password"}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
