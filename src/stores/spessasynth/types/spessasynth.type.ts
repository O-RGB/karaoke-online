import { Sequencer, Synthetizer } from "spessasynth_lib";

export interface SpessasynthStoreProps {
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
