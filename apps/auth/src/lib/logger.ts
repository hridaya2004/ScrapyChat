import pino from "pino";

export const logger = pino({
  formatters: {
    level(label) {
      return { level: label.toUpperCase() };
    },
  },
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    censor: "[REDACTED]",
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "body.apiKey",
      "body.api_key",
    ],
  },
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
});
