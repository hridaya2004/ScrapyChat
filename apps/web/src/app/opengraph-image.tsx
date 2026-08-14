import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/metadata";

export const alt = "ScrapyChat — Scrape any website and chat with its content";

export const size = {
  height: 630,
  width: 1200,
};

export const contentType = "image/png";

export default async function Image() {
  const [fontRegular, fontBold, faviconData] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/GeistSans-Regular.woff")),
    readFile(join(process.cwd(), "assets/fonts/GeistSans-Bold.woff")),
    readFile(join(process.cwd(), "public/favicon-96x96.png"), "base64"),
  ]);

  const faviconSrc = `data:image/png;base64,${faviconData}`;

  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Geist Sans",
        height: "100%",
        justifyContent: "center",
        padding: "80px",
        position: "relative",
        width: "100%",
      }}
    >
      {/* Subtle grid */}
      <div
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          display: "flex",
          inset: 0,
          position: "absolute",
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          position: "relative",
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: "12px" }}>
          {/* biome-ignore lint/performance/noImgElement: ImageResponse requires native <img> */}
          <img
            alt="ScrapyChat"
            height={32}
            src={faviconSrc}
            style={{ borderRadius: "6px" }}
            width={32}
          />
          <span
            style={{
              color: "#71717a",
              fontSize: "20px",
              fontWeight: 400,
              letterSpacing: "-0.01em",
            }}
          >
            {siteConfig.url.replace("https://", "")}
          </span>
        </div>

        <h1
          style={{
            color: "#09090b",
            fontSize: "72px",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            margin: 0,
            maxWidth: "900px",
          }}
        >
          {siteConfig.name}
        </h1>

        <p
          style={{
            color: "#52525b",
            fontSize: "26px",
            fontWeight: 400,
            lineHeight: 1.5,
            margin: 0,
            maxWidth: "700px",
          }}
        >
          {siteConfig.description}
        </p>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          data: fontRegular,
          name: "Geist Sans",
          style: "normal",
          weight: 400,
        },
        {
          data: fontBold,
          name: "Geist Sans",
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}
