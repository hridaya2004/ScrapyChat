import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ProfileSettings from "./profile";

const tabs = [
  {
    label: "Profile",
    component: <ProfileSettings />,
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
        className="flex flex-row w-full h-full overflow-hidden"
        defaultValue={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="h-full min-w-40 items-start bg-sidebar overflow-y-auto">
          {tabs.map((tab) => (
            <TabsTrigger className="h-fit" key={tab.label} value={tab.label}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          {tabs.map((tab) => (
            <TabsContent key={tab.label} value={tab.label} className="h-fit">
              {tab.component}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    );
  }
}
