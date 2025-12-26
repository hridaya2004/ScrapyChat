import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./lib/auth.ts";

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

app.listen(port, () => {
  console.log(`ScrapyChat server listening on port ${port}`);
});
