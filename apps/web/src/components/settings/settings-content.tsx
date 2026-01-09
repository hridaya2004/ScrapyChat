import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { BYOKSection } from "./api-keys/byok-section";
import ProfileSettings from "./profile";
import VersionInfo from "./version-info";

const tabs = [
  {
    label: "Profile",
    component: <ProfileSettings />,
  },
  {
    label: "API Keys",
    component: <BYOKSection />,
  },
  {
    label: "Info",
    component: <VersionInfo />,
  },
];

export default function SettingsContent({
  drawer = false,
}: {
  drawer?: boolean;
}) {
  const [activeTab, setActiveTab] = useState(tabs[0].label);

  if (!drawer) {
    return (
      <Tabs
        className="flex h-full w-full flex-row overflow-hidden"
        defaultValue={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="h-full min-w-40 items-start overflow-y-auto bg-sidebar">
          <div className="flex w-full flex-col gap-1">
            {tabs.map((tab) => (
              <TabsTrigger className="h-fit" key={tab.label} value={tab.label}>
                {tab.label}
              </TabsTrigger>
            ))}
          </div>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          {tabs.map((tab) => (
            <TabsContent className="h-fit" key={tab.label} value={tab.label}>
              {tab.component}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    );
  }

  return (
    <Tabs
      className="flex h-full w-full flex-col overflow-hidden"
      defaultValue={activeTab}
      onValueChange={setActiveTab}
    >
      <div className="container flex items-center">
        <TabsList className="mx-auto mt-4 h-full min-w-40 items-start overflow-y-auto bg-sidebar">
          {tabs.map((tab) => (
            <TabsTrigger className="h-fit" key={tab.label} value={tab.label}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <div className="container flex-1 overflow-y-auto">
        {tabs.map((tab) => (
          <TabsContent
            className="h-fit pb-16"
            key={tab.label}
            value={tab.label}
          >
            {tab.component}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
