import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./lib/auth.ts";
import { encryptData } from "./lib/utils.ts";

const app = express();
const port = 3001;

const ALLOWED_ORIGIN = process.env.TRUSTED_ORIGIN?.split("|");

app.use(
  cors({
    origin: ALLOWED_ORIGIN ?? "",
    credentials: true,
  })
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.get("/api/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return res.json(session);
});

// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());

app.post("/api/api-keys", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  const userId = session?.user.id;
  const { provider, apiKey } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "User is unauthorized." });
  }

  if (!(provider && apiKey)) {
    return res.status(400).json({ error: "Provider and API key are required" });
  }

  const encryptedSalt = process.env.BETTER_AUTH_SECRET
    ? `${process.env.BETTER_AUTH_SECRET}-${userId}`
    : userId;

  const encryptedGoodies = await encryptData(apiKey, encryptedSalt);

  const finalData = JSON.stringify({
    provider_id: provider,
    api_key: encryptedGoodies,
  });

  return res.json(finalData);
});

app.listen(port, () => {
  console.log(`ScrapyChat server listening on port ${port}`);
});
