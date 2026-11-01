import type React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { FPS, SCENE_TIMES } from "./timeline";
import VO from "./vo.json";

/* VO per scene: satu file WAV di public/voice-promo/<scene>.wav.
   Ditempatkan mulai frame awal scene; durasi klip = durasi audio, jadi tidak pernah
   menumpuk ke scene berikutnya selama audio <= panjang scene (dicek di bawah). */
const VO_FILES = VO as Record<string, number>;

/** Scene yang punya VO. Urutan tetap agar render deterministik. */
const VO_SCENES = Object.keys(SCENE_TIMES).filter((k) => VO_FILES[k] > 0) as (keyof typeof SCENE_TIMES)[];

export const VoiceOver: React.FC = () => (
  <>
    {VO_SCENES.map((k) => (
      <Sequence key={k} from={SCENE_TIMES[k].from} durationInFrames={Math.ceil(VO_FILES[k] * FPS)} name={`VO ${k}`}>
        <Audio src={staticFile(`voice-promo/${k}.wav`)} />
      </Sequence>
    ))}
  </>
);
