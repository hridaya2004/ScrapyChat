import z from "zod";

const rawResponseMessageSchema = z.object({
  references: z.string().array(),
  response: z.string(),
});

type ResponseMessage = z.infer<typeof rawResponseMessageSchema>;

export { type ResponseMessage, rawResponseMessageSchema };
