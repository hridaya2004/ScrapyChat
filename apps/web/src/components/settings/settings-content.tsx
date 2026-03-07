import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import AboutSection from "./about";
import { BYOKSection } from "./api-keys/byok-section";
import { InfoSection } from "./info";
import PreferencesSettings from "./preferences";
import ProfileSettings from "./profile";

const tabs = [
  {
    label: "Profile",
    component: <ProfileSettings />,
  },
  {
    label: "Preferences",
    component: <PreferencesSettings />,
  },
  {
    label: "Model Providers",
    component: <BYOKSection />,
  },
  {
    label: "About",
    component: <AboutSection />,
  },
  {
    label: "Info",
    component: <InfoSection />,
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
        orientation="vertical"
      >
        <TabsList className="min-h-full min-w-40 items-start justify-start overflow-y-auto rounded-none! bg-sidebar">
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
      <div className="no-scrollbar shrink-0 overflow-x-auto px-4 py-4">
        <TabsList className="bg-sidebar">
          {tabs.map((tab) => (
            <TabsTrigger
              className="h-fit min-w-24 flex-initial shrink-0"
              key={tab.label}
              value={tab.label}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <div className="container flex-1 overflow-y-auto">
        {tabs.map((tab) => (
          <TabsContent
            className="min-h-full pb-16"
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
