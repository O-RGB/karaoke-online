import { EventManager } from "../events";

// Node Volume
export type INodeKey = "VOLUME" | "PAN" | "CHORUS" | "REVERB";
export type INodeChange = "CHANGE";
export type INodeOption = INodeChange | "MUTE" | "LOCK" | "ACTIVE";

// Node Effect velocity
export type INodeState = "EXPRESSION" | "VELOCITY" | "PROGARM";

export type EventKey = [INodeKey | INodeState, INodeOption];
export type TEventType<T> = TEventCallBack<T>;
export interface SynthNodeProps<T = any> {
  value: T | undefined;
  isMute: boolean;
  event?: EventManager<TEventType<T>> | undefined;
  setLock?: (isLock: boolean) => void;
  setMute?: (mute: boolean) => void;
  setValue?: (value: T) => void;
}

export interface TEventCallBack<T = any> {
  value: T;
  channel?: number;
  eventType?: INodeKey;
}
export interface InstValueSetting {
  velocity: number;
  expression: number;
}
