import type React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { WorldCanvas, type CameraShot } from "./camera";
import { Subtitles } from "./Subtitles";
import { VoiceOver } from "./VoiceOver";
import { C, FONT } from "./theme";
import { DURATION, FPS, SCENE_TIMES as SCENES } from "./timeline";
import { WorldCtx, worldAt } from "./scenes/state";
import { SceneHook, SceneHookOverlay } from "./scenes/SceneHook";
import { SceneChaos, SceneChaosOverlay } from "./scenes/SceneChaos";
import { SceneDiscover, SceneDiscoverOverlay } from "./scenes/SceneDiscover";
import { SceneWallet, SceneWalletOverlay } from "./scenes/SceneWallet";
import { SceneJournal, SceneJournalOverlay } from "./scenes/SceneJournal";
import { SceneLearn, SceneLearnOverlay } from "./scenes/SceneLearn";
import { SceneReminder, SceneReminderOverlay } from "./scenes/SceneReminder";
import { SceneOutro, SceneOutroOverlay } from "./scenes/SceneOutro";

export type Scene = {
  from: number;
  frames: number;
  name: string;
  Body: React.FC;
  Overlay?: React.FC;
};

export const SCENE_LIST: Scene[] = [
  { from: SCENES.hook.from, frames: SCENES.chaos.from - SCENES.hook.from, name: SCENES.hook.name, Body: SceneHook, Overlay: SceneHookOverlay },
  { from: SCENES.chaos.from, frames: SCENES.discover.from - SCENES.chaos.from, name: SCENES.chaos.name, Body: SceneChaos, Overlay: SceneChaosOverlay },
  { from: SCENES.discover.from, frames: SCENES.wallet.from - SCENES.discover.from, name: SCENES.discover.name, Body: SceneDiscover, Overlay: SceneDiscoverOverlay },
  { from: SCENES.wallet.from, frames: SCENES.journal.from - SCENES.wallet.from, name: SCENES.wallet.name, Body: SceneWallet, Overlay: SceneWalletOverlay },
  { from: SCENES.journal.from, frames: SCENES.learn.from - SCENES.journal.from, name: SCENES.journal.name, Body: SceneJournal, Overlay: SceneJournalOverlay },
  { from: SCENES.learn.from, frames: SCENES.reminder.from - SCENES.learn.from, name: SCENES.learn.name, Body: SceneLearn, Overlay: SceneLearnOverlay },
  { from: SCENES.reminder.from, frames: SCENES.outro.from - SCENES.reminder.from, name: SCENES.reminder.name, Body: SceneReminder, Overlay: SceneReminderOverlay },
  { from: SCENES.outro.from, frames: DURATION - SCENES.outro.from, name: SCENES.outro.name, Body: SceneOutro, Overlay: SceneOutroOverlay },
];

/* Kamera global. Satu kunci kemera per batas scene ditaruh di `from` scene itu, sehingga tiap scene
   bergerak dari kunci miliknya ke kunci scene berikutnya (dolly + parallax yang mulus). */
const K = (pos: [number, number, number], look: [number, number, number], fov: number) => ({ pos, look, fov });

export const SHOTS: CameraShot[] = [
  K([0, 3.4, 11.6], [0, 2.6, 1.0], 44), // hook: melihat kasur dari atas
  K([-0.9, 3.2, 10.6], [0, 2.8, 0.4], 44), // hook push-in
  K([1.4, 3.2, 13.2], [0, 2.4, -0.5], 44), // chaos
  K([-1.2, 3.0, 12.2], [0, 2.4, -0.5], 44), // chaos orbit
  K([0, 3.0, 13.4], [0, 2.2, 0], 44), // discover
  K([0, 2.8, 11.4], [0, 2.2, 0], 42), // discover push
  K([-1.6, 3.0, 12.4], [0, 2.2, 0], 44), // wallet
  K([0.8, 2.9, 11.6], [0, 2.1, 0], 42), // wallet push
  K([1.6, 3.1, 12.4], [0, 2.2, 0], 44), // journal
  K([0, 3.0, 11.6], [0, 2.2, 0], 42), // journal push
  K([-1.6, 3.2, 12.6], [0, 2.2, 0], 44), // learn
  K([0, 3.4, 11.4], [0, 2.3, 0], 42), // learn crane
  K([1.6, 3.0, 12.6], [0, 2.2, 0], 44), // reminder
  K([0, 3.2, 11.6], [0, 2.2, 0], 42), // reminder push
  K([0, 3.4, 15.0], [0, 2.4, 0], 40), // outro wide
  K([0, 3.0, 12.6], [0, 2.4, 0], 36), // outro logo
];

export const KandAIPromo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.fog, fontFamily: FONT }}>
    <WorldCanvas shots={SHOTS}>
      {SCENE_LIST.map((s) => (
        <SceneGroup key={s.name} scene={s}>
          <s.Body />
        </SceneGroup>
      ))}
    </WorldCanvas>

    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {SCENE_LIST.map((s) => {
        const O = s.Overlay;
        if (!O) return null;
        return (
          <Sequence key={s.name} from={s.from} durationInFrames={s.frames} name={`overlay ${s.name}`}>
            <O />
          </Sequence>
        );
      })}
    </AbsoluteFill>

    <Subtitles />
    <VoiceOver />
  </AbsoluteFill>
);

/* Scene hanya dirender pada rentang framenya. Frame-nya frame global (bukan di-reset), oleh karena itu
   pakai visibility, bukan <Sequence> yang memotong timeline. */
const SceneGroup: React.FC<{ scene: Scene; children: React.ReactNode }> = ({ scene, children }) => {
  const frame = useCurrentFrame();
  const local = frame - scene.from;
  if (local < 0 || local >= scene.frames) return null;
  return <WorldCtx.Provider value={worldAt(frame, scene.from, scene.frames)}>{children}</WorldCtx.Provider>;
};

export const KAND_AI_PROMO_FPS = FPS;
export const KAND_AI_PROMO_DURATION = DURATION;
