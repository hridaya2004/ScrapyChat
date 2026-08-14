"use client";

import { useMutation } from "@tanstack/react-query";
import {
  EyeIcon,
  EyeOffIcon,
  InfoIcon,
  KeyIcon,
  PlusIcon,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import GoogleIcon from "@/components/icons/google";
import { H4 } from "@/components/typography";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { apiConfig } from "@/config/global";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { apiKeySchema } from "@/model/model/api-key";
import { useModel } from "@/providers/model-provider";

interface Provider {
  defaultKey: string;
  getKeyUrl: string;
  icon: React.ComponentType<{ className?: string }>;
  id: string;
  model: string;
  name: string;
  paid: boolean;
  placeholder: string;
}

const PROVIDERS: Provider[] = [
  {
    defaultKey: "AIza............",
    getKeyUrl: "https://ai.google.dev/gemini-api/docs/api-key",
    icon: GoogleIcon,
    id: "google_genai",
    model: "gemma-4-31b-it",
    name: "Gemma 4",
    paid: true,
    placeholder: "AIza............",
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

  const [showApiKey, setShowApiKey] = useState(false);

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
    const fallbackValue = hasKey ? models[providerId].apiKey : "";
    return apiKeys[providerId] || fallbackValue;
  };

  const getModelName = (providerId: string) => {
    const model = PROVIDERS.find((p) => p.id === providerId);
    if (!model) {
      return "";
    }

    return model.model;
  };

  const saveMutation = useMutation({
    mutationFn: async ({
      provider,
      apiKey,
      modelName,
    }: {
      provider: string;
      apiKey: string;
      modelName: string;
    }) => {
      const res = await fetch(`${apiConfig.authUrl}/api-keys/encrypt`, {
        body: JSON.stringify({
          apiKey,
          modelName,
          provider,
        }),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to save key");
      }

      return res.json();
    },
    onError: (_, { provider }) => {
      const providerConfig = PROVIDERS.find((p) => p.id === provider);
      toast({
        description: `Failed to save ${providerConfig?.name} API key. Please try again.`,
        status: "error",
        title: "Failed to save API key",
      });
    },
    onSuccess: (response, { provider }) => {
      const providerConfig = PROVIDERS.find((p) => p.id === provider);
      const parsed = apiKeySchema.parse(response);

      setModel({
        ...models,
        [provider]: parsed,
      });

      toast({
        description: `Your ${providerConfig?.name} API key has been saved.`,
        title: "API key saved",
      });

      refreshModels();
      setApiKeys((prev) => ({
        ...prev,
        [provider]: parsed.apiKey || "",
      }));
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
    onError: (_, provider) => {
      const providerConfig = PROVIDERS.find((p) => p.id === provider);
      toast({
        description: `Failed to delete ${providerConfig?.name} API key. Please try again.`,
        status: "error",
        title: "Failed to delete API key",
      });
      setDeleteDialogOpen(false);
      setProviderToDelete("");
    },
    onSuccess: (providerId: string) => {
      const providerConfig = PROVIDERS.find((p) => p.id === providerId);

      const updatedModels = { ...models };
      delete updatedModels[providerId];
      setModel(updatedModels);

      toast({
        description: `Your ${providerConfig?.name} API key has been deleted.`,
        title: "API key deleted",
      });

      refreshModels();
      setApiKeys((prev) => ({ ...prev, [providerId]: "" }));
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
    const model = getModelName(providerId);
    if (!value) {
      toast({
        description: "Please enter valid API key.",
        title: "Empty API key",
      });
      return;
    }
    saveMutation.mutate({
      apiKey: value,
      modelName: model,
      provider: providerId,
    });
  };

  return (
    <section className="container px-4 py-2">
      <div className="flex flex-col gap-3">
        <H4>Model Providers</H4>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Select a provider</FieldLegend>
            <FieldDescription>
              Add your own API keys to unlock access to models. Your keys are
              stored securely on your own browser with our hashing algorithm.
            </FieldDescription>

            <div className="grid grid-cols-2 gap-3 min-[400px]:grid-cols-3 min-[500px]:grid-cols-4">
              {PROVIDERS.map((provider) => (
                <button
                  className={cn(
                    "relative flex aspect-square min-w-28 flex-col items-center justify-center gap-2 rounded-lg border p-4",
                    selectedProvider === provider.id
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border"
                  )}
                  key={provider.id}
                  // biome-ignore lint/performance/noJsxPropsBind: provider selection handler
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
          </FieldSet>

          {selectedProviderConfig?.paid && (
            <FieldSet>
              <FieldLegend variant="label">
                {selectedProviderConfig.name} API Key
              </FieldLegend>
              <InputGroup className="rounded-3xl">
                <InputGroupInput
                  className="rounded-3xl"
                  disabled={saveMutation.isPending}
                  id={`${selectedProvider}-key`}
                  // biome-ignore lint/performance/noJsxPropsBind: API key input handler
                  onChange={(e) =>
                    setApiKeys((prev) => ({
                      ...prev,
                      [selectedProvider]: e.target.value,
                    }))
                  }
                  placeholder={selectedProviderConfig.placeholder}
                  type={showApiKey ? "text" : "password"}
                  value={getProviderValue(selectedProvider)}
                />
                <InputGroupAddon align="inline-end">
                  <button
                    className="pe-2 hover:cursor-pointer"
                    // biome-ignore lint/performance/noJsxPropsBind: toggle visibility
                    onClick={() => setShowApiKey((v) => !v)}
                    type="button"
                  >
                    {showApiKey ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </button>
                </InputGroupAddon>
              </InputGroup>
              {getProviderValue(selectedProvider).trim() && (
                <Alert>
                  <InfoIcon />
                  <AlertTitle>Keep your API key safe</AlertTitle>
                  <AlertDescription>
                    If your key appears hashed, it's already saved. Entering it
                    again will hash the hash, breaking authentication. Only
                    paste a new key if you're replacing the existing one.
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex items-center justify-between pl-1">
                <a
                  className="text-muted-foreground text-xs hover:underline"
                  href={selectedProviderConfig.getKeyUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Get API key
                </a>

                <div className="flex gap-2">
                  {models[selectedProvider] && (
                    <Button
                      className="rounded-3xl"
                      disabled={
                        deleteMutation.isPending || saveMutation.isPending
                      }
                      // biome-ignore lint/performance/noJsxPropsBind: delete handler
                      onClick={() => handleDeleteClick(selectedProvider)}
                      type="button"
                      variant="outline"
                    >
                      <Trash2 className="mr-1 size-4" />
                      Delete
                    </Button>
                  )}
                  <Button
                    className="rounded-3xl"
                    disabled={
                      saveMutation.isPending || deleteMutation.isPending
                    }
                    // biome-ignore lint/performance/noJsxPropsBind: save handler
                    onClick={() => handleSave(selectedProvider)}
                    type="button"
                  >
                    {saveMutation.isPending ? (
                      <Spinner
                        className="bg-primary-foreground"
                        size="size-4"
                      />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </div>
            </FieldSet>
          )}
        </FieldGroup>
      </div>

      <AlertDialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl">
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
            <AlertDialogCancel className="rounded-3xl!">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-3xl!"
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
            >
              {deleteMutation.isPending ? (
                <Spinner className="bg-primary-foreground" size="size-4" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};
