"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (
    formData: z.infer<typeof resetPasswordFormSchema>
  ) => {
    setLoading(true);
    try {
      const { data, error } = await authClient.requestPasswordReset({
        email: formData.email,
        redirectTo: `${window.location.origin}/reset-password`,
        fetchOptions: {
          credentials: "include",
        },
      });
      if (error) {
        toast({
          title: "Error while resetting the password.",
          description: error.message,
          status: "error",
        });

        return;
      }
      if (data) {
        toast({
          title: "Reset password link successfully sent",
          description: data.message,
          status: "success",
        });
        router.push("/");

        return;
      }
    } catch {
      toast({
        title: "Error while sending reset link",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (params.error && !params.token) {
    if (params.error === "INVALID_TOKEN") {
      toast({
        title: "Invalid token",
        description: "Please try resetting your password again",
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
              render={({ field }) => (
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
              {loading ? "Sending your reset link" : "Send your reset link"}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
