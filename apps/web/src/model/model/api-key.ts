import z from "zod";

const rawApiKeySchema = z.object({
  api_key: z.string(),
  model: z.string(),
  provider_id: z.string(),
});

const apiKeySchema = rawApiKeySchema.transform((data) => ({
  apiKey: data.api_key,
  modelName: data.model,
  providerId: data.provider_id,
}));

type ModelApiKey = z.infer<typeof apiKeySchema>;

export { apiKeySchema, type ModelApiKey };
