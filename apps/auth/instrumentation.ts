import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import {
  ConsoleMetricExporter,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";

const useOtlp = !!process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

const sdk = new NodeSDK({
  serviceName: process.env.OTEL_SERVICE_NAME || "scrapychat-auth",
  traceExporter: useOtlp ? new OTLPTraceExporter() : new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: useOtlp ? new OTLPMetricExporter() : new ConsoleMetricExporter(),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
