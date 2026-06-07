// import "../instrumentation.ts";
import cluster from "node:cluster";
import os from "node:os";
import process from "node:process";
import { logger } from "./lib/logger";

if (cluster.isPrimary) {
  const workerCount = os.availableParallelism();
  logger.info({ workerCount }, "Forking worker processes");

  for (let i = 0; i < workerCount; i++) {
    const worker = cluster.fork();
    worker.on("online", () => {
      logger.info(
        { pid: worker.process.pid, workerId: worker.id },
        "Worker online"
      );
    });
  }

  cluster.on("exit", (worker, code, signal) => {
    logger.warn(
      { pid: worker.process.pid, workerId: worker.id, code, signal },
      "Worker process exited"
    );
  });

  cluster.on("disconnect", (worker) => {
    logger.warn(
      { pid: worker.process.pid, workerId: worker.id },
      "Worker disconnected"
    );
  });
} else {
  await import("./server");
  logger.info({ pid: process.pid }, "Worker process started");
}
