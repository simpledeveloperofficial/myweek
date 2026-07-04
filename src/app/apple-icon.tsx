import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at 30% 20%, rgba(244, 254, 255, 0.55), transparent 34%), linear-gradient(160deg, #f4feff 0%, #a9c0e0 45%, #0e2f76 100%)",
          borderRadius: 42,
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "rgba(255,255,255,0.18)",
            border: "1px solid rgba(255,255,255,0.38)",
            borderRadius: 38,
            boxShadow:
              "0 16px 40px rgba(14, 47, 118, 0.28), inset 0 1px 0 rgba(255,255,255,0.55)",
            color: "#0e2f76",
            display: "flex",
            fontFamily: "Arial",
            fontSize: 72,
            fontWeight: 800,
            height: 132,
            justifyContent: "center",
            width: 132,
          }}
        >
          MW
        </div>
      </div>
    ),
    size,
  );
}
