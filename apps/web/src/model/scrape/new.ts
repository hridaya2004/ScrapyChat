import z from "zod";

const scrapeNewSchema = z.object({
  url: z.url(),
  deep_search: z.boolean(),
});

type ScrapeNew = z.infer<typeof scrapeNewSchema>;

export { scrapeNewSchema, type ScrapeNew };
