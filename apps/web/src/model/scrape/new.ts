import z from "zod";

const scrapeNewSchema = z.object({
  deep_search: z.boolean(),
  url: z.url(),
});

type ScrapeNew = z.infer<typeof scrapeNewSchema>;

export { type ScrapeNew, scrapeNewSchema };
