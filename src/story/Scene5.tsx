import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { K, Kicker, LineReveal, Reveal, Stage, ip, lerp, mono, serif, sharp, snap } from "./shared";

/* Beat, awal dari timing VO: 1 @0 · 2 @188 (bukan waktu tambahan) · 3 @344 (KAND AI + URL) */
const T = {
  l1: 6,
  l2: 16,
  l3: 30,
  l4: 210,
  l5: 226,
  l6: 300,
  mark: 352,
  brand: 372,
  tagline: 392,
  url: 420,
  pulse: 440,
};

const URL_TEXT = "kandai.my.id";

export const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const dark = ip(f, [T.brand - 6, T.brand + 18], [0, 1], sharp);
  const rule = ip(f, [T.mark, T.mark + 26], [0, 1], sharp);
  const pulse = 1 + 0.05 * ip(f, [T.pulse, T.pulse + 12, T.pulse + 30], [0, 1, 0]);

  return (
    <Stage dark>
      <AbsoluteFill style={{ background: dark > 0.5 ? K.ink : K.bg }}>
        {/* kolom tipografi kiri */}
        <AbsoluteFill style={{ opacity: 1 - ip(f, [T.brand, T.brand + 16], [0, 1]) }}>
          <div style={{ position: "absolute", left: 90, top: 120 }}>
            <Kicker>Penutup</Kicker>
          </div>
          <div style={{ position: "absolute", left: 90, top: 250, width: 900, opacity: 1 - ip(f, [T.l4 - 16, T.l4], [0, 1], sharp) }}>
            <LineReveal at={T.l1} size={128}>
              <div style={{ ...serif(122) }}>Nggak harus</div>
            </LineReveal>
            <LineReveal at={T.l2} size={128}>
              <div style={{ ...serif(122) }}>bisa semuanya</div>
            </LineReveal>
            <LineReveal at={T.l3} size={128}>
              <div style={{ ...serif(122), fontStyle: "italic", color: K.red }}>sekaligus.</div>
            </LineReveal>
          </div>

          <div style={{ position: "absolute", left: 90, top: 790, width: 900, height: 4, background: K.ink, transform: `scaleX(${ip(f, [T.l4 - 10, T.l4 + 10], [0, 1], sharp)})`, transformOrigin: "left" }} />

          <div style={{ position: "absolute", left: 90, top: 840, width: 900, opacity: ip(f, [T.l4, T.l4 + 16], [0, 1]) }}>
            <div style={{ ...mono(32, K.mute, 700), letterSpacing: 4 }}>YANG DIBUTUHKAN</div>
            <div style={{ ...mono(32, K.red, 500), marginTop: 26, textDecoration: "line-through", textDecorationThickness: 4 }}>waktu tambahan</div>
            <div style={{ ...serif(150), color: K.ink, marginTop: 30 }}>bantuan</div>
            <LineReveal at={T.l5 + 8} size={150}>
              <div style={{ ...serif(150), fontStyle: "italic", color: K.red }}>yang tepat.</div>
            </LineReveal>
          </div>
        </AbsoluteFill>

        {/* kartu merek */}
        <AbsoluteFill style={{ opacity: ip(f, [T.mark, T.mark + 14], [0, 1]), visibility: f < T.mark ? "hidden" : undefined }}>
          <div style={{ position: "absolute", left: 0, width: 1080, top: 420, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 260, height: 260, boxSizing: "border-box", border: `10px solid ${K.red}`, transform: `scale(${pulse}) rotate(${lerp(-6, 0, rule)}deg)`, display: "grid", placeItems: "center", background: K.ink }}>
              <div style={{ ...serif(150, K.cream), letterSpacing: -4 }}>K</div>
            </div>
          </div>

          <div style={{ position: "absolute", left: 0, width: 1080, top: 730, display: "flex", justifyContent: "center" }}>
            <div style={{ ...serif(96, K.cream), letterSpacing: 6, transform: `scale(${lerp(1.06, 1, ip(f, [T.brand, T.brand + 20], [0, 1], snap))})` }}>KAND AI</div>
          </div>
          <div style={{ position: "absolute", left: 0, width: 1080, top: 862, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 300 * ip(f, [T.brand + 8, T.brand + 32], [0, 1], sharp), height: 5, background: K.red }} />
          </div>
          <Reveal at={T.tagline} style={{ position: "absolute", left: 0, width: 1080, top: 900, display: "flex", justifyContent: "center" }}>
            <div style={{ ...mono(32, "#B9B3A2", 500), textAlign: "center", lineHeight: 1.6 }}>satu asisten untuk<br />membantu mengelola keseharianmu.</div>
          </Reveal>

          {/* URL sebagai blok bar */}
          <div style={{ position: "absolute", left: 90, right: 90, top: 1120 }}>
            <div style={{ background: K.red, transform: `scaleX(${ip(f, [T.url, T.url + 18], [0, 1], sharp)})`, transformOrigin: "left", height: 150, display: "flex", alignItems: "center", justifyContent: "center", opacity: ip(f, [T.url, T.url + 6], [0, 1]) }}>
              <div style={{ ...mono(62, K.cream, 700), letterSpacing: -1 }}>{URL_TEXT}</div>
            </div>
          </div>
          <div style={{ position: "absolute", left: 0, width: 1080, top: 1310, display: "flex", justifyContent: "center", opacity: ip(f, [T.url + 16, T.url + 30], [0, 1]) }}>
            <div style={{ ...mono(26, "#8A8574", 700), letterSpacing: 6 }}>MULAI RAPIKAN HARIMU</div>
          </div>
        </AbsoluteFill>

        <div style={{ position: "absolute", left: 90, bottom: 90, ...mono(22, "#6E6A5C", 700), letterSpacing: 4, opacity: 0.8 }}>
          KANDAI.MY.ID · 2026
        </div>
      </AbsoluteFill>
    </Stage>
  );
};
