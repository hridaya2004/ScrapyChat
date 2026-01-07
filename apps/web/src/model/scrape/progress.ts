import z from "zod";

const scrapeProgressSchema = z.object({
  url: z.url(),
  progress: z.number().min(0).max(1),
});

type ScrapeProgress = z.infer<typeof scrapeProgressSchema>;

export { scrapeProgressSchema, type ScrapeProgress };
