import z from "zod";

const rawScrapeListSchema = z.object({
  urls: z.url().array(),
});

const scrapeListSchema = rawScrapeListSchema.transform((data) => ({
  ingestedUrls: data.urls,
}));

type ScrapeList = z.infer<typeof scrapeListSchema>;

export { scrapeListSchema, type ScrapeList };
