import { create } from "zustand";
import { Sequencer, Synthetizer, WORKLET_URL_ABSOLUTE } from "spessasynth_lib";
import { DEFAULT_SOUND_FONT } from "@/config/value";

interface SpessasynthState {
  synth: Synthetizer | undefined;
  player: Sequencer | undefined;
  audio: AudioContext | undefined;
  analysers: AnalyserNode[];
  perset: IPersetSoundfont[];
  defaultSoundFont: File | undefined;
  SFname: string | undefined;
  setupSpessasynth: () => Promise<void>;
  setSoundFontName: (name: string) => void;
}

export const useSpessasynthStore = create<SpessasynthState>((set, get) => ({
  synth: undefined,
  player: undefined,
  audio: undefined,
  analysers: [],
  perset: [],
  defaultSoundFont: undefined,
  SFname: undefined,
  setSoundFontName: (name: string) => set({ SFname: name }),
  setupSpessasynth: async () => {
    const { audio, synth, player } = await setupSpessasynth();
    set({ audio, synth, player });
  },
}));

async function setupSpessasynth() {
  const { audioContext, channels } = await loadAudioContext();
  if (!audioContext)
    return { audio: undefined, synth: undefined, player: undefined };

  const synth = await loadSoundFontPlayer(audioContext);
  if (!synth) return { audio: undefined, synth: undefined, player: undefined };

  const player = await loadPlayer(synth);
  await loadSoundMeter(synth, audioContext);

  return { audio: audioContext, synth, player };
}

async function loadAudioContext(): Promise<{
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

async function loadSoundFontPlayer(audio: AudioContext) {
  const res = await fetch(DEFAULT_SOUND_FONT);
  const ab = await res.arrayBuffer();
  const synthInstance = new Synthetizer(audio.destination, ab);

  synthInstance.eventHandler.addEvent(
    "presetlistchange",
    "",
    (event: IPersetSoundfont[]) => {
      let sort = event.sort((a, b) => a.program - b.program);
      sort = sort.filter((x, i) => i !== 1);
      useSpessasynthStore.setState({ perset: sort });
    }
  );

  synthInstance.setMainVolume(0.7);
  synthInstance.highPerformanceMode = true;

  // for (let i = 0; i < 16; i++) {
  //   synthInstance.setPitchBendRange(i, 12); // ตั้งค่า range เป็น 12 semitones
  // }

  const blob = new Blob([ab], { type: "application/octet-stream" });
  const sf = new File([blob], "soundfont.sf2", {
    type: "application/octet-stream",
  });
  useSpessasynthStore.setState({
    defaultSoundFont: sf,
    SFname: "soundfont เริ่มต้น.sf2",
  });

  await synthInstance.isReady;
  return synthInstance;
}

async function loadPlayer(synth: Synthetizer) {
  const seq = new Sequencer([], synth);
  seq.loop = false;
  return seq;
}

async function loadSoundMeter(synth: Synthetizer, audio: AudioContext) {
  const newAnalysers: AnalyserNode[] = Array.from({ length: 16 }, () => {
    const analyser = audio.createAnalyser();
    analyser.fftSize = 256;
    return analyser;
  });
  synth.connectIndividualOutputs(newAnalysers);
  useSpessasynthStore.setState({ analysers: newAnalysers });
}
