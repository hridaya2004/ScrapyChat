"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { FieldSeparator, FieldSet } from "../ui/field";
import Github from "./providers/github";

const signUpFormSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string(),
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

  const onSubmit = async (values: z.infer<typeof signUpFormSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const { data, error } = await authClient.signUp.email({
      ...values,
    });
    if (data) {
      console.log(data);
    }
    if (error) {
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form
        className="p-4 flex flex-col gap-4"
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
                <Input
                  className="rounded-3xl"
                  placeholder="******"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="rounded-full w-full">
          Register
        </Button>

        <FieldSeparator className="my-4 font-bold">OR</FieldSeparator>

        <FieldSet className="items-center">
          <Github />
        </FieldSet>
      </form>
    </Form>
  );
}
