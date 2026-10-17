import React from "react";
import { Composition } from "remotion";
import { KandAI, KAND_AI_DURATION, KAND_AI_FPS } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="KandAI"
      component={KandAI}
      durationInFrames={KAND_AI_DURATION}
      fps={KAND_AI_FPS}
      width={1080}
      height={1920}
    />
  );
};
