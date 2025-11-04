"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloudIcon } from "lucide-react";
import { useRef, useState } from "react";
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
  image: z.string().nullable(),
});

export default function ChangeUserDetails() {
  const { data } = authClient.useSession();

  const userDetailsForm = useForm<z.infer<typeof userDetailsSchema>>({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: {
      name: data?.user.name,
      image: data?.user.image,
    },
  });

  const [preview, setPreview] = useState<string | null>(
    data?.user.image ?? null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (values: z.infer<typeof userDetailsSchema>) => {
    await authClient.updateUser({
      name: values.name,
      image: values.image,
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
              <FormField
                control={userDetailsForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="w-fit">
                    <FormControl>
                      <div className="flex flex-col items-center gap-2">
                        <div className="group relative size-20">
                          <Avatar className="size-20">
                            <AvatarImage
                              alt={`${data?.user.name}'s Profile Picture`}
                              src={
                                preview as unknown as string | Blob | undefined
                              }
                            />
                            <AvatarFallback>
                              {data?.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <Button
                              className="rounded-full bg-white/90 hover:bg-white"
                              onClick={() => fileInputRef.current?.click()}
                              size="icon"
                              type="button"
                              variant="secondary"
                            >
                              <UploadCloudIcon className="text-black" />
                            </Button>
                          </div>
                        </div>

                        <Input
                          accept="image/*"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const base64String = reader.result as string;
                                setPreview(base64String);
                                field.onChange(base64String);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          ref={fileInputRef}
                          type="file"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            <Button className="rounded-3xl" size="sm">
              Save changes
            </Button>
            <Button
              className="rounded-3xl"
              onClick={() => {
                userDetailsForm.reset({
                  name: data?.user.name,
                  image: data?.user.image,
                });
                setPreview(data?.user.image ?? null);
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
