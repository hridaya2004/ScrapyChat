"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { type ControllerRenderProps, useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import ResetPass from "./reset-pass";

const resetPasswordFormSchema = z.object({
  email: z.email(),
});

export function ResetPassword({
  data,
}: {
  data: {
    token?: string;
    error?: string;
  };
}) {
  const params = data;
  const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(resetPasswordFormSchema),
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const renderEmailField = useCallback(
    ({
      field,
    }: {
      field: ControllerRenderProps<
        z.infer<typeof resetPasswordFormSchema>,
        "email"
      >;
    }) => (
      <FormItem>
        <FormControl>
          <Input
            className="rounded-3xl"
            placeholder="user@example.com"
            type="email"
            {...field}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    ),
    []
  );

  const onSubmit = async (
    formData: z.infer<typeof resetPasswordFormSchema>
  ) => {
    setLoading(true);
    try {
      const { data: resetData, error } = await authClient.requestPasswordReset({
        email: formData.email,
        fetchOptions: {
          credentials: "include",
        },
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast({
          description: error.message,
          status: "error",
          title: "Error while resetting the password.",
        });

        return;
      }
      if (resetData) {
        toast({
          description: resetData.message,
          status: "success",
          title: "Reset password link successfully sent",
        });
        router.push("/");
      }
    } catch {
      toast({
        status: "error",
        title: "Error while sending reset link",
      });
    } finally {
      setLoading(false);
    }
  };

  if (params.error && !params.token) {
    if (params.error === "INVALID_TOKEN") {
      toast({
        description: "Please try resetting your password again",
        title: "Invalid token",
      });
    }
    router.push("/reset-password");
    router.refresh();
  }

  if (params.token) {
    return <ResetPass token={params.token} />;
  }

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Card className="w-full max-w-sm gap-4 rounded-3xl p-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl tracking-tight">
            Reset your password
          </CardTitle>
          <CardDescription>
            Enter the email you want to recover password
          </CardDescription>
        </div>
        <Form {...form}>
          <form
            className="flex flex-col gap-2"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="email"
              render={renderEmailField}
            />

            <Button
              className="mt-2 rounded-full"
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <Spinner className="bg-primary-foreground" size="size-4" />
              ) : null}
              {loading ? "Sending your reset link" : "Send your reset link"}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
