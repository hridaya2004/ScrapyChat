import z from "zod";

const scrapeNewSchema = z.object({
  url: z.url(),
});

type ScrapeNew = z.infer<typeof scrapeNewSchema>;

export { scrapeNewSchema, type ScrapeNew };
