import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./lib/auth.ts";
import { decryptData, encryptData } from "./lib/utils.ts";

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

app.post("/api/api-keys/encrypt", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  const userId = session?.user.id;
  const { provider, apiKey, modelName } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "User is unauthorized." });
  }

  if (!(provider && apiKey && modelName)) {
    return res
      .status(400)
      .json({ error: "Required fields are not satisfied." });
  }

  if (!process.env.BETTER_AUTH_SECRET) {
    return res.status(500).json({
      error: "Secret not provided.",
    });
  }

  const uniqueSalt = `${process.env.BETTER_AUTH_SECRET}-${userId}`;

  const encryptedGoodies = await encryptData(apiKey, uniqueSalt);

  return res.json({
    provider_id: provider,
    api_key: encryptedGoodies,
    model: modelName,
  });
});

app.post("/api/api-keys/decrypt", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  const userId = session?.user.id;
  const { apiKey } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "User is unauthorized." });
  }

  if (!apiKey) {
    return res.status(400).json({ error: "API key are required" });
  }

  if (!process.env.BETTER_AUTH_SECRET) {
    return res.status(500).json({
      error: "Secret not provided.",
    });
  }

  const uniqueSalt = `${process.env.BETTER_AUTH_SECRET}-${userId}`;

  const decryptedGoodies = await decryptData(apiKey, uniqueSalt);

  return res.json({
    api_key: decryptedGoodies,
  });
});

app.listen(port, () => {
  console.log(`ScrapyChat server listening on port ${port}`);
});
