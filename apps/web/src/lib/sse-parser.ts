import type { ScrapeProgress } from "@/model/scrape/progress";

const parseSSELine = (
  line: string,
  onProgress: (data: ScrapeProgress) => void
): void => {
  if (!line.startsWith("data: ")) {
    return;
  }

  // this trims out the data: {} part
  const jsonStr = line.slice(6).trim();
  try {
    const parsedJson = JSON.parse(jsonStr);
    onProgress(parsedJson);
  } catch (e) {
    console.error("Failed to parse SSE data:", e);
  }
};

const processSSEBuffer = (
  buffer: string,
  onProgress: (data: ScrapeProgress) => void
): string => {
  const lines = buffer.split("\n");
  const remainingBuffer = lines.pop() || "";

  for (const line of lines) {
    parseSSELine(line, onProgress);
  }

  return remainingBuffer;
};

const streamSSEResponse = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onProgress: (data: ScrapeProgress) => void
): Promise<void> => {
  const decoder = new TextDecoder();
  let buffer = "";

  // biome-ignore lint/suspicious/noUnnecessaryConditions: stream is read until the producer closes it
  while (true) {
    // biome-ignore lint/performance/noAwaitInLoops: SSE chunks must be consumed sequentially
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    if (value) {
      buffer += decoder.decode(value, { stream: true });
      buffer = processSSEBuffer(buffer, onProgress);
    }
  }
};

export { streamSSEResponse };
