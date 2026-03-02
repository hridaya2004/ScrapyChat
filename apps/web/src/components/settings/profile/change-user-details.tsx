import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  FieldContent,
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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const MINIMUM_NAME_LENGTH = 2;
const MAXIMUM_NAME_LENGTH = 100;

const userDetailsSchema = z.object({
  name: z.string().min(MINIMUM_NAME_LENGTH).max(MAXIMUM_NAME_LENGTH),
});

export default function ChangeUserDetails() {
  const { data } = authClient.useSession();

  const userDetailsForm = useForm<z.infer<typeof userDetailsSchema>>({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: {
      name: data?.user.name,
    },
  });

  // changing user's image is yet not supported
  // look into https://github.com/better-auth/better-auth/issues/7589
  const onSubmit = async (values: z.infer<typeof userDetailsSchema>) => {
    await authClient.updateUser({
      name: values.name,
    });
  };

  return (
    <Form {...userDetailsForm}>
      <form onSubmit={userDetailsForm.handleSubmit(onSubmit)}>
        <FieldSet>
          <FieldLegend>Change user information</FieldLegend>
          <FieldDescription>
            You can change your name and profile picture here.
          </FieldDescription>
          <FieldContent>
            <FieldGroup>
              <Avatar className="size-20">
                <AvatarImage
                  alt={`${data?.user.name}'s Profile Picture`}
                  src={data?.user.image ?? undefined}
                />
                <AvatarFallback>
                  {data?.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <FormField
                control={userDetailsForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-fit">
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input className="rounded-3xl" type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FieldGroup>
          </FieldContent>
          <FieldSet className="inline-flex flex-row items-center">
            <Button className="rounded-3xl">Save changes</Button>
            <Button
              className="rounded-3xl"
              onClick={() => {
                userDetailsForm.reset({
                  name: data?.user.name,
                });
              }}
              type="button"
              variant="ghost"
            >
              Reset changes
            </Button>
          </FieldSet>
        </FieldSet>
      </form>
    </Form>
  );
}
