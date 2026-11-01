import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import timing from "../timing-story.json";
import { STORY } from "../story";
import { Scene1 } from "./Scene1";
import { Scene2 } from "./Scene2";
import { Scene3 } from "./Scene3";
import { Scene4 } from "./Scene4";
import { Scene5 } from "./Scene5";

export const KAND_AI_STORY_FPS = 30;
const GAP = 0.5; // jeda antar scene (detik)

const T = timing as Record<string, number>;

/* Durasi scene = jumlah durasi VO bagian-bagiannya, dibulatkan ke frame. */
const bagianDur = (id: string) => {
  const sc = STORY.find((s) => s.id === id);
  if (!sc) throw new Error(`story tidak ada: ${id}`);
  return sc.bagian.map((_, i) => T[`${id}-${i + 1}`]);
};

/* Timeline dari timing VO: tiap bagian diputar mulai tepat di frame awalnya. */
export const buildTimeline = () => {
  let cursor = 0;
  const scenes = STORY.map((sc) => {
    const durs = bagianDur(sc.id);
    const frames = durs.map((s) => Math.round(s * KAND_AI_STORY_FPS));
    const items = frames.map((fr, i) => ({ key: `${sc.id}-${i + 1}`, from: cursor, frames: fr }));
    const start = cursor;
    cursor += frames.reduce((a, b) => a + b, 0) + Math.round(GAP * KAND_AI_STORY_FPS);
    return { id: sc.id, start, duration: cursor - Math.round(GAP * KAND_AI_STORY_FPS) - start, items };
  });
  return { scenes, total: cursor - Math.round(GAP * KAND_AI_STORY_FPS) };
};

const TL = buildTimeline();
export const KAND_AI_STORY_DURATION = TL.total;

const SCENES = [Scene1, Scene2, Scene3, Scene4, Scene5];

export const KandAIStory: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#16150F" }}>
      {TL.scenes.map((sc, i) => {
        const C = SCENES[i];
        return (
          <Sequence key={sc.id} from={sc.start} durationInFrames={sc.duration} name={`${i + 1} ${sc.id}`}>
            <C />
          </Sequence>
        );
      })}
      {TL.scenes.flatMap((sc) =>
        sc.items.map((it) => (
          <Sequence key={it.key} from={it.from} durationInFrames={it.frames} name={`VO ${it.key}`}>
            <Audio src={staticFile(`audio/${it.key}.wav`)} />
          </Sequence>
        )),
      )}
    </AbsoluteFill>
  );
};
