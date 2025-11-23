import { apiConfig } from "@/config/global";
import { type ScrapeList, scrapeListSchema } from "@/model/scrape/list";
import { toast } from "../ui/toast";

const getScrapeList = async (token: string): Promise<ScrapeList> => {
  if (!token.trim()) {
    console.error("Token missing");
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

const scrapeNewUrl = async (scrapeUrl: string, token: string) => {
  if (!token.trim()) {
    console.error("Token missing");
    return;
  }

  try {
    const response = await fetch(`${apiConfig.baseUrl}/scrape/new`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
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
      return;
    }

    if (response.ok) {
      toast({
        title: "Success",
        description: "Scraping started.",
        status: "success",
      });

      return;
    }
  } catch (err) {
    console.log(err);
    return;
  }

  return null;
};

export { getScrapeList, scrapeNewUrl };
