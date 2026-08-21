import { apiConfig } from "@/config/global";
import { streamSSEResponse } from "@/lib/sse-parser";
import { type ScrapeList, scrapeListSchema } from "@/model/scrape/list";
import type { ScrapeProgress } from "@/model/scrape/progress";
import { scrapeRemoveSchema } from "@/model/scrape/remove";
import { toast } from "../ui/toast";

const getScrapeList = async (token: string): Promise<ScrapeList> => {
  if (!token.trim()) {
    return {
      ingestedUrls: [],
    };
  }

  try {
    const response = await fetch(`${apiConfig.baseUrl}/scrape/list`, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();

      const parsed = scrapeListSchema.safeParse(data);

      if (parsed.error) {
        toast({
          description: "Failed to parse scraped websites.",
          status: "error",
          title: "Error",
        });

        console.error(parsed.error);
        return {
          ingestedUrls: [],
        };
      }

      if (parsed.success) {
        return parsed.data;
      }
    } else {
      toast({
        description: "Failed to get scraped list data from API.",
        status: "error",
        title: "API failed",
      });
    }
  } catch {
    return {
      ingestedUrls: [],
    };
  }

  return {
    ingestedUrls: [],
  };
};

const postScrapeNewUrl = async (
  scrapeUrl: string,
  isDeepSearchEnabled: boolean,
  token: string,
  callback?: (success: boolean, loading: boolean) => void
) => {
  if (!token.trim()) {
    callback?.(false, false);
    return;
  }

  try {
    callback?.(false, true);
    const response = await fetch(`${apiConfig.baseUrl}/scrape/new`, {
      body: JSON.stringify({
        deep_search: isDeepSearchEnabled,
        url: scrapeUrl,
      }),
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      if (response.status === 409) {
        // 409 is dupe conflict
        try {
          const errorData = JSON.parse(await response.text());
          toast({
            description: errorData.detail || "URL already exists",
            status: "error",
            title: "Failed to scrape given URL",
          });
        } catch {
          toast({
            description: "URL already exists",
            status: "error",
            title: "Failed to scrape given URL",
          });
        }
      } else {
        toast({
          description: "Failed to start scraping.",
          status: "error",
          title: "Error",
        });
      }

      callback?.(false, false);
      return;
    }

    if (response.ok) {
      toast({
        description: "Scraping started.",
        status: "success",
        title: "Success",
      });
      callback?.(true, false);
    }
  } catch (err) {
    console.error(err);
    toast({
      description: "An error occurred while starting the scrape.",
      status: "error",
      title: "Error",
    });
    callback?.(false, false);
  }
};

const getScrapeProgress = async (
  token: string,
  onProgress: (data: ScrapeProgress) => void
): Promise<void> => {
  if (!token.trim()) {
    return;
  }

  try {
    const response = await fetch(`${apiConfig.baseUrl}/scrape/progress`, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No reader available");
    }

    await streamSSEResponse(reader, onProgress);
  } catch (error) {
    if (error instanceof Error && error.name !== "AbortError") {
      console.error("SSE Error:", error);
    }
  }
};

const deleteScrapeUrl = async (
  url: string,
  token: string,
  callback?: (success: boolean, loading: boolean) => void
) => {
  if (!token.trim()) {
    callback?.(false, false);
    return;
  }

  const parsed = scrapeRemoveSchema.safeParse({ url });

  if (parsed.error) {
    toast({
      description: "The URL provided is not valid.",
      status: "error",
      title: "Invalid URL",
    });
    callback?.(false, false);
    return;
  }

  try {
    callback?.(false, true);
    const response = await fetch(`${apiConfig.baseUrl}/scrape/remove`, {
      body: JSON.stringify({ url: parsed.data.url }),
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "DELETE",
    });

    if (response.ok) {
      toast({
        description: "Scraped URL has been removed.",
        status: "success",
        title: "Deleted",
      });
      callback?.(true, false);
      return;
    }

    toast({
      description: "Failed to delete the scraped URL.",
      status: "error",
      title: "Error",
    });
    callback?.(false, false);
  } catch (err) {
    console.error(err);
    toast({
      description: "An error occurred while deleting the scraped URL.",
      status: "error",
      title: "Error",
    });
    callback?.(false, false);
  }
};

const deleteAllScrapeUrls = async (
  token: string,
  callback?: (success: boolean, loading: boolean) => void
) => {
  if (!token.trim()) {
    callback?.(false, false);
    return;
  }

  try {
    callback?.(false, true);
    const response = await fetch(`${apiConfig.baseUrl}/scrape/remove-all`, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "DELETE",
    });

    if (response.ok) {
      toast({
        description: "All scraped URLs have been removed.",
        status: "success",
        title: "Deleted",
      });
      callback?.(true, false);
      return;
    }

    toast({
      description: "Failed to delete all scraped URLs.",
      status: "error",
      title: "Error",
    });
    callback?.(false, false);
  } catch (err) {
    console.error(err);
    toast({
      description: "An error occurred while deleting all scraped URLs.",
      status: "error",
      title: "Error",
    });
    callback?.(false, false);
  }
};

export {
  deleteAllScrapeUrls,
  deleteScrapeUrl,
  getScrapeList,
  getScrapeProgress,
  postScrapeNewUrl,
};
