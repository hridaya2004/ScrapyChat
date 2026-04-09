import z from "zod";

const rawApiKeySchema = z.object({
  provider_id: z.string(),
  api_key: z.string(),
  model: z.string(),
});

const apiKeySchema = rawApiKeySchema.transform((data) => ({
  providerId: data.provider_id,
  apiKey: data.api_key,
  modelName: data.model,
}));

type ModelApiKey = z.infer<typeof apiKeySchema>;

export { apiKeySchema, type ModelApiKey };
