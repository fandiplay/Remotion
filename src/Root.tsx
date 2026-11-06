import React from "react";
import { Composition } from "remotion";
import { KandAI, KAND_AI_DURATION, KAND_AI_FPS } from "./Composition";
import { VideoAI, VIDEO_AI_DURATION } from "./VideoAI";
import { KandAIStory, KAND_AI_STORY_DURATION, KAND_AI_STORY_FPS } from "./story/Story";
import { DemoKonflik } from "./story/DemoKonflik";
import { KandAIPromo, KAND_AI_PROMO_DURATION, KAND_AI_PROMO_FPS } from "./kandai-promo/Promo";

import { RumahBaru, RUMAH_BARU_CONFIG } from "./rumahbaru";

import { IklanStadion, IKLAN_STADION_CONFIG } from "./iklanstadion";
import {ArsitekturBerpikir, ARSITEKTUR_BERPIKIR} from './arsitekturberpikir';
import {Sitara, SITARA} from './sitara';
import { DnaVideo, DNA_FPS, DNA_WIDTH, DNA_HEIGHT, DNA_DURATION_IN_FRAMES } from "./dna";
import {Fisika, FISIKA_DURATION, FISIKA_FPS, FISIKA_WIDTH, FISIKA_HEIGHT} from './fisika';
import { Kurs, KURS_DURATION, KURS_FPS } from "./kurs";



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
        id="KandAIStory"
        component={KandAIStory}
        durationInFrames={KAND_AI_STORY_DURATION}
        fps={KAND_AI_STORY_FPS}
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
      <Composition
        id="KandAIPromo"
        component={KandAIPromo}
        durationInFrames={KAND_AI_PROMO_DURATION}
        fps={KAND_AI_PROMO_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="DemoKonflik"
        component={DemoKonflik}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id={IKLAN_STADION_CONFIG.id}
        component={IklanStadion}
        durationInFrames={IKLAN_STADION_CONFIG.durationInFrames}
        fps={IKLAN_STADION_CONFIG.fps}
        width={IKLAN_STADION_CONFIG.width}
        height={IKLAN_STADION_CONFIG.height}
      />
      <Composition
  id="ArsitekturBerpikir"
  component={ArsitekturBerpikir}
  durationInFrames={ARSITEKTUR_BERPIKIR.durationInFrames}
  fps={ARSITEKTUR_BERPIKIR.fps}
  width={ARSITEKTUR_BERPIKIR.width}
  height={ARSITEKTUR_BERPIKIR.height}
/>
      <Composition id={SITARA.id} component={Sitara}
  durationInFrames={SITARA.durationInFrames} fps={SITARA.fps}
  width={SITARA.width} height={SITARA.height} />
      <Composition id="Dna" component={DnaVideo} fps={DNA_FPS}
  width={DNA_WIDTH} height={DNA_HEIGHT} durationInFrames={DNA_DURATION_IN_FRAMES} />
      <Composition id="Fisika" component={Fisika}
  durationInFrames={FISIKA_DURATION} fps={FISIKA_FPS}
  width={FISIKA_WIDTH} height={FISIKA_HEIGHT} />
      <Composition id="Kurs" component={Kurs} durationInFrames={KURS_DURATION}
  fps={KURS_FPS} width={1080} height={1920} />
    </>
  );
};
