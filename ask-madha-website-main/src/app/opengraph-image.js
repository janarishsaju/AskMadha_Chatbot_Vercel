import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-static";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  const logoData = await readFile(path.join(process.cwd(), "public/assets/logo.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f59e0b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 64,
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <img
          src={logoSrc}
          width={120}
          height={120}
          style={{
            borderRadius: 28,
            marginBottom: 40,
          }}
        />
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          Ask Madha
        </div>
        <div
          style={{
            fontSize: 32,
            marginTop: 24,
            textAlign: "center",
            opacity: 0.9,
            maxWidth: 900,
          }}
        >
          Your AI companion for the Bible
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
