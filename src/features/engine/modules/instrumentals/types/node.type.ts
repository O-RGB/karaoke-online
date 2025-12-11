import { EventEmitter } from "../events";

export type DrumNotesType =
  | "acoustic_bass_drum"
  | "bass_drum_1"
  | "side_stick"
  | "acoustic_snare"
  | "hand_clap"
  | "electric_snare"
  | "low_floor_tom"
  | "closed_hi_hat"
  | "high_floor_tom"
  | "pedal_hi_hat"
  | "low_tom"
  | "open_hi_hat"
  | "low_mid_tom"
  | "hi_mid_tom"
  | "crash_cymbal_1"
  | "high_tom"
  | "ride_cymbal_1"
  | "chinese_cymbal"
  | "ride_bell"
  | "tambourine"
  | "splash_cymbal"
  | "cowbell"
  | "crash_cymbal_2"
  | "vibraslap"
  | "ride_cymbal_2"
  | "hi_bongo"
  | "low_bongo"
  | "mute_hi_conga"
  | "open_hi_conga"
  | "low_conga"
  | "high_timbale"
  | "low_timbale"
  | "high_agogo"
  | "low_agogo"
  | "cabasa"
  | "maracas"
  | "short_whistle"
  | "long_whistle"
  | "short_guiro"
  | "long_guiro"
  | "claves"
  | "hi_wood_block"
  | "low_wood_block"
  | "mute_cuica"
  | "open_cuica"
  | "mute_triangle"
  | "open_triangle";

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

export type InstrumentDrum =
  | "general"
  | "lukthung"
  | "lukkrung"
  | "phuea_chiwit"
  | "sixties"
  | "string"
  | "shock"
  | "jimmix"
  | "saching"
  | "jazz"
  | "thai_classical";

export type INodeKey = "MAX_VOLUME" | "VOLUME" | "PAN" | "CHORUS" | "REVERB";
export type INodeOption = "CHANGE" | "MUTE" | "LOCK" | "ACTIVE";
export type INodeState =
  | "EXPRESSION"
  | "VELOCITY"
  | "PROGARM"
  | "VOLUME"
  | "DRUM"
  | "EQUALIZER";
export type INoteState = "VELOCITY" | "NOTE_ON" | "NOTE_OFF";

export type EventKey<K = any> = [K, INodeOption];
export type TEventType<K = any, R = any> = TEventCallBack<K, R>;
export interface SynthControlProps<K = any, R = any> {
  value?: R;
  backupValue?: R;
  isMute: boolean;
  event?: EventEmitter<K, TEventType<R>>;
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

export interface IMidiOutput {
  port: MIDIOutput | null;
  isConnected: boolean;
}
