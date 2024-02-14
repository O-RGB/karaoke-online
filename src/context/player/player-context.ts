import React from "react";

import Midi from "../../interfaces/midi";
import SoundFont from "../../interfaces/soundfont";

export interface MidiState {
  midi: Midi;
  buffer: ArrayBuffer;
}

export interface PlayerHook {
  // Midi
  midi: MidiState | null;
  loadMidi: (midi: Midi | File) => Promise<boolean>;

  // SoundFont
  soundFont: SoundFont | null;
  loadSoundFont: (soundFont: SoundFont | File) => Promise<void>;

  // Lyrics
  lyrics: string[] | null;
  loadLyrics: (lyrics: File) => Promise<void>;

  // Player
  currentTick: number;
  totalTicks: number;
  seek: (position: number) => unknown;
  settingSound: (channel: number, velocity: number) => void;
  sound: IChannel[] | null;

  playing: boolean;
  setPlaying: (playing: boolean) => unknown;
  repeat: boolean;
  setRepeat: (repeat: boolean) => unknown;

  // Actions
  render: () => unknown;
  isRendering: boolean;
}

export const PlayerContext = React.createContext<PlayerHook>({
  // Midi
  midi: null,
  loadMidi: async () => false,

  // SoundFont
  soundFont: null,
  loadSoundFont: async () => {},
  // SoundFont
  lyrics: null,
  loadLyrics: async () => {},

  // Player
  currentTick: 0,
  totalTicks: 0,
  seek: () => {},
  settingSound: () => {},
  sound: null,

  playing: false,
  setPlaying: () => {},
  repeat: false,
  setRepeat: () => {},

  // Actions
  render: () => {},
  isRendering: false,
});
