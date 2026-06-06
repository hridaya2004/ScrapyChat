import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import Elysia from "elysia";
import z from "zod";
import { auth } from "./lib/auth";
import { OpenAPI } from "./lib/openapi";
import { decryptData, encryptData } from "./lib/utils";

const port = 3001;

const ALLOWED_ORIGIN = process.env.TRUSTED_ORIGIN?.split("|");

const betterAuth = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session) {
          return status(401);
        }

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });

const app = new Elysia()
  .use(
    cors({
      origin: ALLOWED_ORIGIN,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .use(
    openapi({
      path: "/openapi.json",
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
    })
  )
  .use(betterAuth)
  .get("/version", () => ({
    version: process.env.APP_VERSION || "unknown",
  }))
  .get("/api/user", ({ user }) => user, {
    auth: true,
  })
  .post(
    "/api/api-keys/encrypt",
    async (ctx) => {
      if (!process.env.BETTER_AUTH_SECRET) {
        return ctx.status(500, {
          error: "Secret not provided.",
        });
      }

      const { provider, apiKey, modelName } = ctx.body;

      const uniqueSalt = `${process.env.BETTER_AUTH_SECRET}-${ctx.user.id}`;
      const encryptedGoodies = await encryptData(apiKey, uniqueSalt);

      return {
        provider_id: provider,
        api_key: encryptedGoodies,
        model: modelName,
      };
    },
    {
      body: z.object({
        provider: z.string(),
        apiKey: z.string(),
        modelName: z.string(),
      }),
      auth: true,
    }
  )
  .post(
    "/api/api-keys/decrypt",
    async (ctx) => {
      const token = ctx.headers.authorization?.split(" ")[1];

      if (!token) {
        return ctx.status(401, { error: "Token not provided" });
      }

      const decryptedToken = await auth.api.verifyJWT({
        body: {
          token,
        },
      });

      if (!decryptedToken.payload) {
        return ctx.status(401, { error: "Token is invalid." });
      }

      const { apiKey } = ctx.body;

      if (!process.env.BETTER_AUTH_SECRET) {
        return ctx.status(500, { error: "Secret not provided." });
      }

      // subject - user.id
      const uniqueSalt = `${process.env.BETTER_AUTH_SECRET}-${decryptedToken.payload.sub}`;

      const decryptedGoodies = await decryptData(apiKey, uniqueSalt);

      return {
        api_key: decryptedGoodies,
      };
    },
    {
      body: z.object({
        apiKey: z.string(),
      }),
    }
  )
  .listen(port);

console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
