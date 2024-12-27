import { midiControllers } from "spessasynth_lib";
import { DataController } from "../lib/node";

export const MAIN_VOLUME = midiControllers.mainVolume;
export const PAN = midiControllers.pan;
export const REVERB = 91;
export const CHORUSDEPTH = 93;

export type NodeType = "VOLUME" | "PAN" | "REVERB" | "CHORUSDEPTH" | "GAIN";
export type EventChangeType = "CHANGE" | "MUTE" | "LOCK" | "PROGARM";

export interface ControllerItemList {
  name: NodeType;
  controller: DataController;
}

export interface INodeCallBack<T = any> {
  channel: number;
  value: T;
  type: NodeType;
  eventType: EventChangeType;
}
