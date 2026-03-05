import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/metadata";

export const alt = "ScrapyChat — Scrape any website and chat with its content";

export const size = {
  width: 1200,
  height: 630,
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
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        fontFamily: "Geist Sans",
        position: "relative",
      }}
    >
      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          display: "flex",
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* biome-ignore lint/performance/noImgElement: ImageResponse requires native <img> */}
          <img
            alt="ScrapyChat"
            height="32"
            src={faviconSrc}
            style={{ borderRadius: "6px" }}
            width="32"
          />
          <span
            style={{
              fontSize: "20px",
              color: "#71717a",
              fontWeight: 400,
              letterSpacing: "-0.01em",
            }}
          >
            {siteConfig.url.replace("https://", "")}
          </span>
        </div>

        <h1
          style={{
            fontSize: "72px",
            fontWeight: 700,
            color: "#09090b",
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
            margin: 0,
            maxWidth: "900px",
          }}
        >
          {siteConfig.name}
        </h1>

        <p
          style={{
            fontSize: "26px",
            color: "#52525b",
            lineHeight: 1.5,
            margin: 0,
            maxWidth: "700px",
            fontWeight: 400,
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
          name: "Geist Sans",
          data: fontRegular,
          style: "normal",
          weight: 400,
        },
        {
          name: "Geist Sans",
          data: fontBold,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}
