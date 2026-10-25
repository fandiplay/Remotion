import React from "react";
import { Composition } from "remotion";
import { KandAI, KAND_AI_DURATION, KAND_AI_FPS } from "./Composition";
import { VideoAI, VIDEO_AI_DURATION } from "./VideoAI";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="KandAI"
        component={KandAI}
        durationInFrames={KAND_AI_DURATION}
        fps={KAND_AI_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="VideoAI"
        component={VideoAI}
        durationInFrames={VIDEO_AI_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
