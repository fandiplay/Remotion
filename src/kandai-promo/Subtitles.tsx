import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT, ip } from "./theme";
import { SUBTITLES } from "./timeline";

/* Subtitle wajib: tiap cue aktif pada rentang framenya sendiri, fade 6 frame di tepi. */
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = SUBTITLES.find((c) => frame >= c.from && frame < c.to);

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 108 }}>
      {cue && (
        <div
          key={cue.from}
          style={{
            fontFamily: FONT,
            fontSize: 44,
            fontWeight: 600,
            lineHeight: 1.25,
            color: C.cream,
            textAlign: "center",
            maxWidth: 900,
            padding: "18px 34px",
            borderRadius: 22,
            background: "rgba(10,14,26,0.62)",
            border: "1px solid rgba(253,243,228,0.14)",
            letterSpacing: 0.2,
            textShadow: "0 2px 12px rgba(0,0,0,0.45)",
            opacity: Math.min(
              ip(frame, [cue.from, cue.from + 6], [0, 1]),
              interpolate(frame, [cue.to - 6, cue.to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            ),
            translate: `0 ${ip(frame, [cue.from, cue.from + 6], [10, 0])}px`,
          }}
        >
          {cue.text}
        </div>
      )}
    </AbsoluteFill>
  );
};
