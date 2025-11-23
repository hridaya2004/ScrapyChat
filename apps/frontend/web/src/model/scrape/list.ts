import z from "zod";

const rawScrapeListSchema = z.object({
  ingested_urls: z.url().array(),
});

const scrapeListSchema = rawScrapeListSchema.transform((data) => ({
  ingestedUrls: data.ingested_urls,
}));

type ScrapeList = z.infer<typeof scrapeListSchema>;

export { scrapeListSchema, type ScrapeList };
