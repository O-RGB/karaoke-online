import { EventManager } from "../events";

export type InstrumentType =
  | "piano"
  | "chromatic_percussion"
  | "organ"
  | "guitar_clean"
  | "guitar_nylon"
  | "guitar_jazz"
  | "guitar_overdriven"
  | "guitar_distortion"
  | "bass"
  | "string"
  | "ensemble"
  | "brass"
  | "reed"
  | "pipe"
  | "synth_lead"
  | "synth_pad"
  | "synth_effect"
  | "ethnic"
  | "percussive"
  | "sound_effects";

export type INodeKey = "VOLUME" | "PAN" | "CHORUS" | "REVERB";
export type INodeChange = "CHANGE";
export type INodeOption = INodeChange | "MUTE" | "LOCK" | "ACTIVE";
export type INodeState = "EXPRESSION" | "VELOCITY" | "PROGARM";

export type EventKey<K = any> = [K, INodeOption];
export type TEventType<K = any, R = any> = TEventCallBack<K, R>;
export interface SynthNodeProps<K = any, R = any> {
  value: R | undefined;
  isMute: boolean;
  event?: EventManager<K, TEventType<R>> | undefined;
  setLock?: (isLock: boolean) => void;
  setMute?: (mute: boolean) => void;
  setValue?: (value: R) => void;
}

export interface TEventCallBack<K = any, R = any> {
  value: R;
  channel?: number;
  eventType?: K;
}
export interface InstValueSetting {
  velocity: number;
  expression: number;
}
