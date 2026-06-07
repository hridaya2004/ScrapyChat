import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "body.apiKey",
      "body.api_key",
    ],
    censor: "[REDACTED]",
  },
  formatters: {
    level(label) {
      return { level: label.toUpperCase() };
    },
  },
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
});
