"use client";

import { useEffect, useState } from "react";
import { AuthContextProvider } from "./auth-context-provider";
import { DialogProvider } from "./dialog-context-provider";
import { HapticsProvider } from "./haptics-provider";
import { ModelContextProvider } from "./model-provider";
import { QueryPromptUrlProvider } from "./query-prompt-url-provider";
import { ChatSessionProvider } from "./session-provider";

function AuthGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <AuthContextProvider>{children}</AuthContextProvider>;
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <ChatSessionProvider>
        <QueryPromptUrlProvider>
          <ModelContextProvider>
            <DialogProvider>
              <HapticsProvider>{children}</HapticsProvider>
            </DialogProvider>
          </ModelContextProvider>
        </QueryPromptUrlProvider>
      </ChatSessionProvider>
    </AuthGate>
  );
}
