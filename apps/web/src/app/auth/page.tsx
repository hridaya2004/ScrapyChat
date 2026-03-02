"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Login from "@/components/auth/login";
import Register from "@/components/auth/register";
import { Lead } from "@/components/typography";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";

const tabs = [
  {
    label: "Login",
    component: <Login />,
  },
  {
    label: "Register",
    component: <Register />,
  },
];

export default function Page() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  if (isPending || session) {
    return (
      <div className="flex h-full items-center justify-center">
        <Lead>Loading...</Lead>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Card className="flex w-full max-w-sm flex-col items-center rounded-3xl p-2">
        <Tabs className="w-full" defaultValue="Login">
          <TabsList className="w-full rounded-3xl">
            {tabs.map((tab) => (
              <TabsTrigger
                className="w-full rounded-3xl"
                key={tab.label}
                value={tab.label}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.label} value={tab.label}>
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}
