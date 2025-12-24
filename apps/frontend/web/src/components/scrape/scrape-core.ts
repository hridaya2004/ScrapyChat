import { apiConfig } from "@/config/global";
import { type ScrapeList, scrapeListSchema } from "@/model/scrape/list";
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
  } catch (error) {
    console.error(error);

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
      toast({
        title: "Error",
        description: "Failed to start scraping.",
        status: "error",
      });

      console.error(await response.text());
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
    console.log(err);
    return;
  }

  return null;
};

export { getScrapeList, scrapeNewUrl };
