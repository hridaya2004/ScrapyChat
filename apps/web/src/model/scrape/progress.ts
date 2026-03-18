import z from "zod";

const scrapeProgressSchema = z.record(z.url(), z.number().min(0).max(1));

type ScrapeProgress = z.infer<typeof scrapeProgressSchema>;

export { type ScrapeProgress, scrapeProgressSchema };
