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
            "radial-gradient(circle at 20% 16%, rgba(244,254,255,0.98), rgba(244,254,255,0.25) 26%, transparent 42%), linear-gradient(145deg, #9db9e7 0%, #4a7fe0 22%, #173f95 58%, #0e2f76 100%)",
          borderRadius: 42,
          boxShadow:
            "inset 0 2px 6px rgba(255,255,255,0.55), inset 0 -6px 14px rgba(6,20,58,0.32)",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          overflow: "hidden",
          width: "100%",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(232,242,255,0.9) 68%, rgba(194,216,245,0.92) 100%)",
            border: "1.5px solid rgba(255,255,255,0.56)",
            borderRadius: 30,
            boxShadow:
              "inset 0 2px 6px rgba(255,255,255,0.95), inset 0 -8px 12px rgba(64,110,182,0.15), 0 8px 18px rgba(9,29,78,0.18)",
            display: "flex",
            flexDirection: "column",
            height: 124,
            overflow: "hidden",
            position: "relative",
            width: 138,
          }}
        >
          <div
            style={{
              display: "flex",
              background:
                "linear-gradient(180deg, rgba(63,111,212,0.92) 0%, rgba(17,58,144,1) 100%)",
              height: 34,
              position: "relative",
            }}
          >
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                style={{
                  background:
                    "linear-gradient(180deg, rgba(244,254,255,0.98) 0%, rgba(176,207,255,0.95) 100%)",
                  borderRadius: 999,
                  height: 18,
                  left: 22 + index * 35,
                  position: "absolute",
                  top: -3,
                  width: 10,
                }}
              />
            ))}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 7,
              padding: "16px 18px 14px",
              position: "relative",
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                style={{
                  background:
                    index === 1 || index === 4
                      ? "linear-gradient(180deg, rgba(76,129,229,0.96) 0%, rgba(17,59,145,1) 100%)"
                      : "rgba(244,254,255,0.82)",
                  borderRadius: 10,
                  height: 28,
                  width: 28,
                }}
              />
            ))}
            <div
              style={{
                background:
                  "linear-gradient(90deg, rgba(88,138,232,0.24) 0%, rgba(34,89,190,0.54) 50%, rgba(128,172,237,0.24) 100%)",
                borderRadius: 999,
                height: 10,
                left: 10,
                position: "absolute",
                top: 54,
                transform: "rotate(-8deg)",
                width: 118,
              }}
            />
          </div>

          <div
            style={{
              alignItems: "center",
              background:
                "linear-gradient(180deg, rgba(35,82,183,1) 0%, rgba(10,39,110,1) 100%)",
              border: "1.5px solid rgba(255,255,255,0.4)",
              borderRadius: 999,
              bottom: 10,
              display: "flex",
              height: 34,
              justifyContent: "center",
              position: "absolute",
              right: 10,
              width: 34,
            }}
          >
            <div
              style={{
                borderBottom: "5px solid #f4feff",
                borderLeft: "3px solid transparent",
                borderRadius: 2,
                borderRight: "5px solid #f4feff",
                height: 16,
                transform: "rotate(45deg) translateY(-2px)",
                width: 10,
              }}
            />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
