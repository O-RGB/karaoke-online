// src/features/engine/modules/spessasynth/lib/spessasynth.ts
import { DEFAULT_SOUND_FONT } from "@/config/value";
import { Sequencer, Synthetizer, WORKLET_URL_ABSOLUTE } from "spessasynth_lib";

export async function loadAudioContext(): Promise<{
  audioContext: AudioContext | undefined;
  channels: AudioNode[];
}> {
  if (typeof window === "undefined") {
    console.warn(
      "AudioContext cannot be loaded in this environment (not in browser)."
    );
    return { audioContext: undefined, channels: [] };
  }

  try {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    await audioContext.audioWorklet.addModule(
      new URL(WORKLET_URL_ABSOLUTE, window.location.origin).toString()
    );

    const splitter = audioContext.createChannelSplitter(16);
    const channels: AudioNode[] = Array.from({ length: 16 }, (_, i) => {
      const channelGain = audioContext.createGain();
      splitter.connect(channelGain, i);
      return channelGain;
    });

    return { audioContext, channels };
  } catch (error) {
    console.error("Error loading AudioContext or adding audio worklet:", error);
    return { audioContext: undefined, channels: [] };
  }
}

// CHANGED: ระบุ return type เป็น Promise<Synthetizer> ให้ชัดเจน
export async function loadSoundFontPlayer(
  audio: AudioContext
): Promise<Synthetizer> {
  const res = await fetch(DEFAULT_SOUND_FONT);
  const ab = await res.arrayBuffer();
  const synthInstance = new Synthetizer(audio.destination, ab);

  // synthInstance.setMainVolume(0.3);
  // synthInstance.highPerformanceMode = false;

  await synthInstance.isReady;
  return synthInstance;
}

export async function loadPlayer(synth: Synthetizer): Promise<Sequencer> {
  const seq = new Sequencer([], synth);
  seq.loop = false;
  return seq;
}
