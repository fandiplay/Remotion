import { createContext, useContext } from "react";
import { warmth } from "../theme";

/* Scene tidak menerima `w` sebagai prop; nilainya dari frame saat ini (global), dibagikan lewat context. */
export type World = { w: number; local: number; dur: number; frame: number };

export const WorldCtx = createContext<World>({ w: 0, local: 0, dur: 1, frame: 0 });

export const useWorld = () => useContext(WorldCtx);

export const worldAt = (frame: number, from: number, dur: number): World => ({ w: warmth(frame), local: frame - from, dur, frame });
