import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
import { FieldSeparator, FieldSet } from "../ui/field";
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

export const MINIMUM_PASSWORD_LENGTH = 8;
export const MAXMIMUM_PASSWORD_LENGTH = 100;
export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{}[\]|;:'",.<>/?]).{8,}$/;

const signUpFormSchema = z.object({
  name: z
    .string({
      error: "Name is required",
    })
    .min(2, {
      error: "Name must be at least 2 characters",
    })
    .max(100, {
      error: "Name must be at most 100 characters",
    }),
  email: z.email({
    error: "Email is required",
  }),
  password: z
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
});

export default function Register() {
  const form = useForm<z.infer<typeof signUpFormSchema>>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (values: z.infer<typeof signUpFormSchema>) => {
    const { data, error } = await authClient.signUp.email({
      ...values,
    });
    if (data && !data.user.emailVerified) {
      toast({
        title: "Email registered, check your inbox",
        description: "We've sent you a verification email.",
        status: "info",
      });
    }
    if (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        status: "error",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4 p-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  className="rounded-3xl"
                  placeholder="John Doe"
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
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
                      onClick={() => setShowPassword((v) => !v)}
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
        <Button className="w-full rounded-full" type="submit">
          Register
        </Button>

        <FieldSeparator className="my-4 font-semibold" spanClassName="bg-card">
          OR
        </FieldSeparator>

        <FieldSet className="items-center">
          <Github />
        </FieldSet>
      </form>
    </Form>
  );
}
