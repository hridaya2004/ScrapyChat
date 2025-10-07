"use client";

import { redirect } from "next/navigation";
import Login from "@/components/auth/login";
import Register from "@/components/auth/register";
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

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (session) {
    return redirect("/");
  }

  return (
    <div className="flex flex-col h-full items-center justify-center">
      <Card className="p-2 max-w-sm w-full flex flex-col rounded-3xl items-center">
        <Tabs defaultValue="Login" className="w-full">
          <TabsList className="w-full rounded-3xl">
            {tabs.map((tab) => (
              <TabsTrigger
                className="w-full rounded-3xl"
                value={tab.label}
                key={tab.label}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent value={tab.label} key={tab.label}>
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}
