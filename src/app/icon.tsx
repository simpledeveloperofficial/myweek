import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

const shellStyle = {
  alignItems: "center" as const,
  background:
    "radial-gradient(circle at 20% 14%, rgba(244,254,255,0.95), rgba(244,254,255,0.28) 26%, transparent 42%), linear-gradient(145deg, #9db9e7 0%, #4a7fe0 22%, #173f95 58%, #0e2f76 100%)",
  borderRadius: 128,
  boxShadow:
    "inset 0 4px 10px rgba(255,255,255,0.55), inset 0 -10px 26px rgba(6,20,58,0.42), 0 24px 72px rgba(8, 23, 65, 0.38)",
  display: "flex" as const,
  height: "100%",
  justifyContent: "center" as const,
  overflow: "hidden" as const,
  position: "relative" as const,
  width: "100%",
};

const calendarBodyStyle = {
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(232,242,255,0.9) 68%, rgba(194,216,245,0.92) 100%)",
  border: "2px solid rgba(255,255,255,0.52)",
  borderRadius: 86,
  boxShadow:
    "inset 0 3px 8px rgba(255,255,255,0.95), inset 0 -12px 20px rgba(64,110,182,0.15), 0 10px 32px rgba(9,29,78,0.18)",
  display: "flex" as const,
  flexDirection: "column" as const,
  height: 344,
  overflow: "hidden" as const,
  position: "relative" as const,
  width: 390,
};

function CalendarGraphic({ compact = false }: { compact?: boolean }) {
  const scale = compact ? 0.35 : 1;
  const badgeSize = compact ? 34 : 92;
  const tileSize = compact ? 28 : 70;

  return (
    <div
      style={{
        ...calendarBodyStyle,
        borderRadius: compact ? 34 : 86,
        height: compact ? 124 : 344,
        width: compact ? 138 : 390,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background:
            "linear-gradient(180deg, rgba(63,111,212,0.92) 0%, rgba(17,58,144,1) 100%)",
          boxShadow: "inset 0 2px 0 rgba(255,255,255,0.35)",
          height: compact ? 34 : 98,
          justifyContent: "center",
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
              boxShadow:
                "inset 0 2px 2px rgba(255,255,255,0.85), 0 2px 10px rgba(4,24,72,0.28)",
              height: compact ? 18 : 58,
              left: compact ? 22 + index * 35 : 58 + index * 108,
              position: "absolute",
              top: compact ? -3 : -10,
              width: compact ? 10 : 26,
            }}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: compact ? 7 : 18,
          padding: compact ? "16px 18px 14px" : "38px 44px 28px",
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
              border: "1px solid rgba(110,156,228,0.2)",
              borderRadius: compact ? 10 : 22,
              boxShadow:
                index === 1 || index === 4
                  ? "inset 0 2px 4px rgba(255,255,255,0.35), 0 4px 10px rgba(10,37,97,0.18)"
                  : "inset 0 2px 4px rgba(255,255,255,0.78)",
              height: tileSize,
              width: tileSize,
            }}
          />
        ))}

        <div
          style={{
            background:
              "linear-gradient(90deg, rgba(88,138,232,0.24) 0%, rgba(34,89,190,0.54) 50%, rgba(128,172,237,0.24) 100%)",
            borderRadius: 999,
            height: compact ? 10 : 26,
            left: compact ? 10 : 18,
            position: "absolute",
            top: compact ? 54 : 152,
            transform: `rotate(-8deg) scale(${scale})`,
            width: compact ? 118 : 340,
          }}
        />
        <div
          style={{
            background:
              "linear-gradient(90deg, rgba(221,236,255,0) 0%, rgba(255,255,255,0.65) 16%, rgba(255,255,255,0.18) 100%)",
            borderRadius: 999,
            height: compact ? 4 : 10,
            left: compact ? 16 : 38,
            position: "absolute",
            top: compact ? 58 : 160,
            transform: "rotate(-8deg)",
            width: compact ? 90 : 248,
          }}
        />
      </div>

      <div
        style={{
          alignItems: "center",
          background:
            "linear-gradient(180deg, rgba(35,82,183,1) 0%, rgba(10,39,110,1) 100%)",
          border: "2px solid rgba(255,255,255,0.4)",
          borderRadius: 999,
          bottom: compact ? 10 : 26,
          boxShadow:
            "inset 0 3px 6px rgba(255,255,255,0.35), 0 12px 20px rgba(9,29,78,0.22)",
          display: "flex",
          height: badgeSize,
          justifyContent: "center",
          position: "absolute",
          right: compact ? 10 : 26,
          width: badgeSize,
        }}
      >
        <div
          style={{
            borderBottom: `${compact ? 5 : 12}px solid #f4feff`,
            borderLeft: `${compact ? 3 : 8}px solid transparent`,
            borderRadius: 2,
            borderRight: `${compact ? 5 : 12}px solid #f4feff`,
            height: compact ? 16 : 38,
            transform: "rotate(45deg) translateY(-2px)",
            width: compact ? 10 : 22,
          }}
        />
      </div>
    </div>
  );
}

export default function Icon() {
  return new ImageResponse(
    (
      <div style={shellStyle}>
        <div
          style={{
            display: "flex",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 28%, transparent 100%)",
            height: 174,
            left: -36,
            position: "absolute",
            right: -36,
            top: -18,
            transform: "rotate(-3deg)",
          }}
        />

        <CalendarGraphic />
      </div>
    ),
    size,
  );
}
