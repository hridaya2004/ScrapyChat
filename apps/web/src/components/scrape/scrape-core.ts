import { apiConfig } from "@/config/global";
import { streamSSEResponse } from "@/lib/sse-parser";
import { type ScrapeList, scrapeListSchema } from "@/model/scrape/list";
import type { ScrapeProgress } from "@/model/scrape/progress";
import { toast } from "../ui/toast";

const getScrapeList = async (token: string): Promise<ScrapeList> => {
  if (!token.trim()) {
    return {
      ingestedUrls: [],
    };
  }

  try {
    const response = await fetch(`${apiConfig.baseUrl}/scrape/list`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();

      const parsed = scrapeListSchema.safeParse(data);

      if (parsed.error) {
        toast({
          title: "Error",
          description: "Failed to parse scraped websites.",
          status: "error",
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
        title: "API failed",
        status: "error",
        description: "Failed to get scraped list data from API.",
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

const scrapeNewUrl = async (
  scrapeUrl: string,
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
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        url: scrapeUrl,
      }),
    });

    if (!response.ok) {
      if (response.status === 409) {
        // 409 is dupe conflict
        toast({
          title: "Failed to scrape given URL",
          description: JSON.parse(await response.text()).detail,
          status: "error",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to start scraping.",
          status: "error",
        });
      }

      callback?.(false, false);
      return;
    }

    if (response.ok) {
      toast({
        title: "Success",
        description: "Scraping started.",
        status: "success",
      });
      callback?.(true, false);
      return;
    }
  } catch (err) {
    console.error(err);
    toast({
      title: "Error",
      description: "An error occurred while starting the scrape.",
      status: "error",
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
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
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

export { getScrapeList, scrapeNewUrl, getScrapeProgress };
