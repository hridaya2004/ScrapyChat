import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { authClient } from "@/lib/auth-client";
import { useAuthContext } from "@/providers/auth-context-provider";
import { Button, buttonVariants } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Field, FieldSeparator, FieldSet } from "../ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { toast } from "../ui/toast";
import Github from "./providers/github";
import Google from "./providers/google";

const loginFormSchema = z.object({
  email: z.email(),
  password: z.string().min(1, {
    message: "Password is required",
  }),
  rememberMe: z.boolean(),
});

export default function Login() {
  const { clearAuthState } = useAuthContext();

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginFormSchema>>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (values: z.infer<typeof loginFormSchema>) => {
    try {
      const { error, data } = await authClient.signIn.email({
        ...values,
      });

      if (error?.code === "EMAIL_NOT_VERIFIED") {
        toast({
          description: "Please check your email and verify your account",
          status: "error",
          title: "Email not verified.",
        });
        return;
      }
      if (error?.code === "INVALID_EMAIL_OR_PASSWORD") {
        toast({
          description: "Please check your email and password",
          status: "error",
          title: "Invalid email or password",
        });
        return;
      }

      if (data?.user || data?.token) {
        clearAuthState?.();
      }
    } catch (err) {
      console.error("An error occurred during login:", err);
      toast({
        description: "An unexpected error occurred. Please try again.",
        status: "error",
        title: "Login failed",
      });
    }
  };

  const togglePassword = useCallback(() => setShowPassword((v) => !v), []);

  const onCheckedChange = useCallback(
    (checked: boolean) => form.setValue("rememberMe", checked),
    [form]
  );

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4 p-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="email"
          // biome-ignore lint/performance/noJsxPropsBind: standard react-hook-form pattern
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
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
        <FormField
          control={form.control}
          name="password"
          // biome-ignore lint/performance/noJsxPropsBind: standard react-hook-form pattern
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <InputGroup className="rounded-3xl">
                  <InputGroupInput
                    placeholder="******"
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
        <Field className="flex justify-between" orientation="horizontal">
          <FormField
            control={form.control}
            name="rememberMe"
            // biome-ignore lint/performance/noJsxPropsBind: standard react-hook-form pattern
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-1">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={onCheckedChange}
                  />
                </FormControl>
                <FormLabel>Remember me</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          <Link
            className={buttonVariants({
              className: "me-0 py-0",
              variant: "link",
            })}
            href="/reset-password"
          >
            Forget password?
          </Link>
        </Field>

        <Button className="w-full rounded-full" type="submit">
          Login
        </Button>

        <FieldSeparator className="my-4 font-semibold" spanClassName="bg-card">
          OR
        </FieldSeparator>

        <FieldSet className="items-center">
          <Github />
        </FieldSet>

        <FieldSet className="items-center">
          <Google />
        </FieldSet>
      </form>
    </Form>
  );
}
