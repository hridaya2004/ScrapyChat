import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import Elysia from "elysia";
import z from "zod";
import { auth } from "./lib/auth";
import { logger } from "./lib/logger";
import { OpenAPI } from "./lib/openapi";
import { decryptData, encryptData } from "./lib/utils";

const port = 3001;

const ALLOWED_ORIGIN = process.env.TRUSTED_ORIGIN?.split("|");

const requestStore = new AsyncLocalStorage<{ requestId: string }>();

const betterAuth = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers });

        if (!session) {
          logger.warn("Session authentication failed");
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
  .onRequest(({ request }) => {
    const url = new URL(request.url);
    const requestId = randomUUID();
    requestStore.enterWith({ requestId });

    logger.info(
      { requestId, method: request.method, path: url.pathname },
      "Incoming request"
    );
  })
  .onError(({ code, error, request }) => {
    const url = new URL(request.url);
    const store = requestStore.getStore();
    logger.error(
      {
        requestId: store?.requestId,
        method: request.method,
        path: url.pathname,
        code,
        err: error,
      },
      "Request failed"
    );
  })
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
  .get("/api/user", ({ user }) => user, { auth: true })
  .post(
    "/api/api-keys/encrypt",
    async (ctx) => {
      const requestId = requestStore.getStore()?.requestId;

      if (!process.env.BETTER_AUTH_SECRET) {
        logger.error({ requestId }, "BETTER_AUTH_SECRET is not configured");
        return ctx.status(500, { error: "Secret not provided." });
      }

      const { provider, apiKey, modelName } = ctx.body;
      const uniqueSalt = `${process.env.BETTER_AUTH_SECRET}-${ctx.user.id}`;
      const encrypted = await encryptData(apiKey, uniqueSalt);

      logger.info(
        { requestId, userId: ctx.user.id, provider },
        "API key encrypted successfully"
      );
      return {
        provider_id: provider,
        api_key: encrypted,
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
      const requestId = requestStore.getStore()?.requestId;
      const token = ctx.headers.authorization?.split(" ")[1];

      if (!token) {
        logger.warn({ requestId }, "Authorization token not provided");
        return ctx.status(401, { error: "Token not provided" });
      }

      const decryptedToken = await auth.api.verifyJWT({
        body: { token },
      });

      if (!decryptedToken.payload) {
        logger.warn({ requestId }, "JWT verification failed");
        return ctx.status(401, { error: "Token is invalid." });
      }

      const { apiKey } = ctx.body;

      if (!process.env.BETTER_AUTH_SECRET) {
        logger.error({ requestId }, "BETTER_AUTH_SECRET is not configured");
        return ctx.status(500, { error: "Secret not provided." });
      }

      const uniqueSalt = `${process.env.BETTER_AUTH_SECRET}-${decryptedToken.payload.sub}`;
      const decrypted = await decryptData(apiKey, uniqueSalt);

      logger.info(
        { requestId, sub: decryptedToken.payload.sub },
        "API key decrypted successfully"
      );
      return { api_key: decrypted };
    },
    {
      body: z.object({
        apiKey: z.string(),
      }),
    }
  )
  .listen(port);

logger.info(
  { hostname: app.server?.hostname, port: app.server?.port },
  "Server started"
);
