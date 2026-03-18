import z from "zod";

const rawResponseMessageSchema = z.object({
  response: z.string(),
  references: z.string().array(),
});

type ResponseMessage = z.infer<typeof rawResponseMessageSchema>;

export { type ResponseMessage, rawResponseMessageSchema };
