import { create } from "zustand";
import { PlayerProps } from "./types/player.type";
import useQueuePlayer from "./modules/queue-player";
import useRuntimePlayer from "./modules/runtime-player";

export const usePlayerNew = create<PlayerProps>(() => ({
  queue: useQueuePlayer.getState(),
  runtime: useRuntimePlayer.getState(),
}));
