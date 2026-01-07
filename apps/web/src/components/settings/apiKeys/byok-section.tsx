"use client";

import { useMutation } from "@tanstack/react-query";
import { KeyIcon, Loader2, PlusIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import GeminiIcon from "@/components/icons/gemini";
import GoogleIcon from "@/components/icons/google";
import { H3, Muted } from "@/components/typography";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { apiConfig } from "@/config/global";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { apiKeySchema } from "@/model/model/api-key";
import { useModel } from "@/providers/model-provider";

interface Provider {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  getKeyUrl: string;
  paid: boolean;
  defaultKey: string;
}

const PROVIDERS: Provider[] = [
  {
    id: "google",
    name: "Google",
    icon: GoogleIcon,
    placeholder: "AIza...",
    paid: true,
    getKeyUrl: "https://ai.google.dev/gemini-api/docs/api-key",
    defaultKey: "AIza............",
  },
  {
    id: "google-selfhost",
    name: "Gemma 3",
    icon: GeminiIcon,
    paid: false,
    placeholder: "AIza............",
    getKeyUrl: "https://ai.google.dev/gemini-api/docs/api-key",
    defaultKey: "AIza............",
  },
];

export const BYOKSection = () => {
  const { setItem: setModel } = useLocalStorage("models");
  const { setItem: setSelectedProvider } = useLocalStorage("selected-model");
  const {
    models,
    refreshModels,
    refreshSelectedModel,
    selectedModel: selectedProvider,
  } = useModel();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<string>("");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  const selectedProviderConfig = PROVIDERS.find(
    (p) => p.id === selectedProvider
  );

  const getProviderValue = (providerId: string) => {
    const provider = PROVIDERS.find((p) => p.id === providerId);
    if (!provider) {
      return "";
    }

    const hasKey = !!models[providerId];
    const fallbackValue = hasKey ? provider.defaultKey : "";
    return apiKeys[providerId] || fallbackValue;
  };

  const saveMutation = useMutation({
    mutationFn: async ({
      provider,
      apiKey,
    }: {
      provider: string;
      apiKey: string;
    }) => {
      const res = await fetch(`${apiConfig.authUrl}/api-keys`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          apiKey,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save key");
      }

      return res.json();
    },
    onSuccess: (response, { provider }) => {
      const providerConfig = PROVIDERS.find((p) => p.id === provider);
      const parsed = apiKeySchema.parse(JSON.parse(response));

      setModel({
        ...models,
        [provider]: parsed,
      });

      toast({
        title: "API key saved",
        description: `Your ${providerConfig?.name} API key has been saved.`,
      });

      refreshModels();
      setApiKeys((prev) => ({
        ...prev,
        [provider]: providerConfig?.defaultKey || "",
      }));
    },
    onError: (_, { provider }) => {
      const providerConfig = PROVIDERS.find((p) => p.id === provider);
      toast({
        title: "Failed to save API key",
        description: `Failed to save ${providerConfig?.name} API key. Please try again.`,
        status: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    // biome-ignore lint/suspicious/useAwait: No need to await as it's done in localStorage
    mutationFn: async (providerId: string) => {
      if (!models[providerId]) {
        throw new Error("Key not found");
      }

      return providerId;
    },
    onSuccess: (providerId: string) => {
      const providerConfig = PROVIDERS.find((p) => p.id === providerId);

      const updatedModels = { ...models };
      delete updatedModels[providerId];
      setModel(updatedModels);

      toast({
        title: "API key deleted",
        description: `Your ${providerConfig?.name} API key has been deleted.`,
      });

      refreshModels();
      setApiKeys((prev) => ({ ...prev, [providerId]: "" }));
      setDeleteDialogOpen(false);
      setProviderToDelete("");
    },
    onError: (_, provider) => {
      const providerConfig = PROVIDERS.find((p) => p.id === provider);
      toast({
        title: "Failed to delete API key",
        description: `Failed to delete ${providerConfig?.name} API key. Please try again.`,
        status: "error",
      });
      setDeleteDialogOpen(false);
      setProviderToDelete("");
    },
  });

  const handleConfirmDelete = () => {
    if (providerToDelete) {
      deleteMutation.mutate(providerToDelete);
    }
  };

  const handleDeleteClick = (providerId: string) => {
    setProviderToDelete(providerId);
    setDeleteDialogOpen(true);
  };

  const handleSave = (providerId: string) => {
    const value = getProviderValue(providerId);
    if (!value) {
      toast({
        title: "Empty API key",
        description: "Please enter valid API key.",
      });
      return;
    }
    saveMutation.mutate({ provider: providerId, apiKey: value });
  };

  return (
    <section className="container px-4 py-2">
      <div className="flex flex-col gap-2">
        <H3>Model Providers</H3>
        <div className="flex flex-col gap-1">
          <Muted>Add your own API keys to unlock access to models.</Muted>
          <Muted>
            Your keys are stored securely on your own browser with our hashing
            algorithm.
          </Muted>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 min-[400px]:grid-cols-3 min-[500px]:grid-cols-4">
          {PROVIDERS.map((provider) => (
            <button
              className={cn(
                "relative flex aspect-square min-w-28 flex-col items-center justify-center gap-2 rounded-lg border p-4",
                selectedProvider === provider.id
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border"
              )}
              key={provider.id}
              onClick={() => {
                setSelectedProvider(provider.id);
                refreshSelectedModel();
              }}
              type="button"
            >
              {models[provider.id] && (
                <span className="absolute top-1 right-1 rounded-sm border bg-secondary p-1">
                  <KeyIcon className="size-3.5 text-secondary-foreground" />
                </span>
              )}
              <provider.icon className="size-4" />
              <span>{provider.name}</span>
            </button>
          ))}
          <button
            className={cn(
              "flex aspect-square min-w-28 flex-col items-center justify-center gap-2 rounded-lg border p-4 opacity-20",
              "border-primary border-dashed"
            )}
            disabled
            key="soon"
            type="button"
          >
            <PlusIcon className="size-4" />
          </button>
        </div>

        {selectedProviderConfig?.paid && (
          <div className="mt-4">
            <div className="flex flex-col">
              <Label className="mb-3" htmlFor={`${selectedProvider}-key`}>
                {selectedProviderConfig.name} API Key
              </Label>
              <Input
                className="rounded-3xl"
                disabled={saveMutation.isPending}
                id={`${selectedProvider}-key`}
                onChange={(e) =>
                  setApiKeys((prev) => ({
                    ...prev,
                    [selectedProvider]: e.target.value,
                  }))
                }
                placeholder={selectedProviderConfig.placeholder}
                type="password"
                value={getProviderValue(selectedProvider)}
              />
              <div className="mt-0 flex items-center justify-between pl-1">
                <a
                  className="mt-1 text-muted-foreground text-xs hover:underline"
                  href={selectedProviderConfig.getKeyUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Get API key
                </a>
                <div className="flex gap-2">
                  {models[selectedProvider] && (
                    <Button
                      className="mt-2"
                      disabled={
                        deleteMutation.isPending || saveMutation.isPending
                      }
                      onClick={() => handleDeleteClick(selectedProvider)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Trash2 className="mr-1 size-4" />
                      Delete
                    </Button>
                  )}
                  <Button
                    className="mt-2 rounded-3xl"
                    disabled={
                      saveMutation.isPending || deleteMutation.isPending
                    }
                    onClick={() => handleSave(selectedProvider)}
                    type="button"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AlertDialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your{" "}
              {PROVIDERS.find((p) => p.id === providerToDelete)?.name} API key?
              This action cannot be undone and you will lose access to{" "}
              {PROVIDERS.find((p) => p.id === providerToDelete)?.name} models.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};
