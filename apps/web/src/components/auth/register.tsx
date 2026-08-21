import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { type ControllerRenderProps, useForm } from "react-hook-form";
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
import Google from "./providers/google";

export const MINIMUM_PASSWORD_LENGTH = 8;
export const MAXMIMUM_PASSWORD_LENGTH = 100;
export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{}[\]|;:'",.<>/?]).{8,}$/;

const signUpFormSchema = z.object({
  email: z.email({
    error: "Email is required",
  }),
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
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
    resolver: zodResolver(signUpFormSchema),
  });

  const [showPassword, setShowPassword] = useState(false);

  type SignUpValues = z.infer<typeof signUpFormSchema>;

  const toggleShowPassword = useCallback(() => {
    setShowPassword((v) => !v);
  }, []);

  const renderNameField = useCallback(
    ({ field }: { field: ControllerRenderProps<SignUpValues, "name"> }) => (
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
    ),
    []
  );

  const renderEmailField = useCallback(
    ({ field }: { field: ControllerRenderProps<SignUpValues, "email"> }) => (
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
    ),
    []
  );

  const renderPasswordField = useCallback(
    ({ field }: { field: ControllerRenderProps<SignUpValues, "password"> }) => (
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
                onClick={toggleShowPassword}
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
    ),
    [showPassword, toggleShowPassword]
  );

  const onSubmit = async (values: z.infer<typeof signUpFormSchema>) => {
    const { data, error } = await authClient.signUp.email({
      ...values,
    });
    if (data && !data.user.emailVerified) {
      toast({
        description: "We've sent you a verification email.",
        status: "info",
        title: "Email registered, check your inbox",
      });
    }
    if (error) {
      toast({
        description: error.message,
        status: "error",
        title: "Registration failed",
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
          render={renderNameField}
        />
        <FormField
          control={form.control}
          name="email"
          render={renderEmailField}
        />
        <FormField
          control={form.control}
          name="password"
          render={renderPasswordField}
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

        <FieldSet className="items-center">
          <Google />
        </FieldSet>
      </form>
    </Form>
  );
}
