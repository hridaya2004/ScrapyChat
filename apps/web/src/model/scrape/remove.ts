import z from "zod";

const TRAILING_SLASHES = /\/+$/;

const scrapeRemoveSchema = z.object({
  url: z.url().transform((val) => val.replace(TRAILING_SLASHES, "")),
});

type ScrapeRemove = z.infer<typeof scrapeRemoveSchema>;

export { type ScrapeRemove, scrapeRemoveSchema };
