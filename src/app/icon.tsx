import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at 30% 20%, rgba(244, 254, 255, 0.55), transparent 34%), linear-gradient(160deg, #f4feff 0%, #a9c0e0 45%, #0e2f76 100%)",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.18)",
            border: "1px solid rgba(255,255,255,0.38)",
            borderRadius: 120,
            boxShadow:
              "0 32px 80px rgba(14, 47, 118, 0.35), inset 0 1px 0 rgba(255,255,255,0.55)",
            display: "flex",
            flexDirection: "column",
            height: 390,
            justifyContent: "space-between",
            overflow: "hidden",
            padding: "52px 46px",
            width: 390,
          }}
        >
          <div
            style={{
              alignItems: "center",
              color: "#0e2f76",
              display: "flex",
              fontFamily: "Arial",
              fontSize: 56,
              fontWeight: 700,
              justifyContent: "space-between",
              letterSpacing: 0,
              opacity: 0.9,
            }}
          >
            <span>My</span>
            <span>Week</span>
          </div>

          <div
            style={{
              background: "rgba(14,47,118,0.12)",
              border: "1px solid rgba(14,47,118,0.14)",
              borderRadius: 42,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              padding: "28px 24px",
            }}
          >
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                style={{
                  alignItems: "center",
                  display: "flex",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    background: row === 1 ? "#0e2f76" : "rgba(14,47,118,0.2)",
                    borderRadius: 999,
                    height: 20,
                    width: 20,
                  }}
                />
                <div
                  style={{
                    background:
                      row === 1
                        ? "linear-gradient(90deg, rgba(14,47,118,0.95), rgba(14,47,118,0.6))"
                        : "rgba(14,47,118,0.2)",
                    borderRadius: 999,
                    height: 18,
                    width: row === 2 ? 180 : 230,
                  }}
                />
              </div>
            ))}
          </div>

          <div
            style={{
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                color: "#0e2f76",
                display: "flex",
                fontFamily: "Arial",
                fontSize: 94,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              MW
            </div>
            <div
              style={{
                alignItems: "center",
                background: "#0e2f76",
                borderRadius: 999,
                color: "#f4feff",
                display: "flex",
                fontFamily: "Arial",
                fontSize: 28,
                fontWeight: 700,
                height: 68,
                justifyContent: "center",
                width: 68,
              }}
            >
              5-11
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
