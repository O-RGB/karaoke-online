"use client";
import { DEFAULT_SOUND_FONT } from "@/config/value";
import { createContext, FC, useEffect, useState } from "react";
import {
  midiControllers,
  Sequencer,
  Synthetizer,
  WORKLET_URL_ABSOLUTE,
} from "spessasynth_lib";
import { useRemote } from "../hooks/peer-hooks";

type SpessasynthContextType = {
  setupSpessasynth: () => Promise<void>;
  audioGain: number[];
  instrument: number[];
  synth: Synthetizer | undefined;
  player: Sequencer | undefined;
  audio: AudioContext | undefined;
};

type SpessasynthProviderProps = {
  children: React.ReactNode;
};

export const SpessasynthContext = createContext<SpessasynthContextType>({
  setupSpessasynth: async () => undefined,
  audioGain: [],
  instrument: [],
  synth: undefined,
  player: undefined,
  audio: undefined,
});

export const SpessasynthProvider: FC<SpessasynthProviderProps> = ({
  children,
}) => {
  const { sendSuperUserMessage, superUserConnections } = useRemote();
  const [synth, setSynth] = useState<Synthetizer>();
  const [player, setPlayer] = useState<Sequencer>();
  const [audio, setAudio] = useState<AudioContext>();

  // Display
  const [audioGain, setAudioGain] = useState<number[]>([]);
  const [instrument, setInstrument] = useState<number[]>([]);

  const loadPlayer = async (synth: Synthetizer) => {
    const seq = new Sequencer([], synth);
    return seq;
  };

  const loadSoundFontPlayer = async (audio: AudioContext) => {
    const res = await fetch(DEFAULT_SOUND_FONT);
    const ab = await res.arrayBuffer();

    const synthInstance = new Synthetizer(audio.destination, ab);

    // Default Setting
    synthInstance.muteChannel(8, true);
    synthInstance.setMainVolume(0.5);
    synthInstance.highPerformanceMode = true;

    await synthInstance.isReady;
    return synthInstance;
  };

  const loadAudioContext = async () => {
    if (typeof window !== "undefined") {
      const audio = new AudioContext();
      await audio.audioWorklet.addModule(
        new URL(WORKLET_URL_ABSOLUTE, window.location.origin).toString()
      );
      return audio;
    } else {
      return undefined;
    }
  };

  const synthProgramChange = (synth: Synthetizer) => {
    synth.eventHandler.addEvent("programchange", "", (e) => {
      const channel: number = e.channel;
      const program: number = e.program;
      setInstrument((value) => {
        value[channel] = program;
        return value;
      });
    });
  };

  const loadSoundMeter = async (synth: Synthetizer, audio: AudioContext) => {
    const newAnalysers: AnalyserNode[] = [];
    for (let i = 0; i < 16; i++) {
      const analyser = audio.createAnalyser();
      analyser.fftSize = 256;
      newAnalysers.push(analyser);
      synth.lockController(i, midiControllers.mainVolume, false);
    }
    synth.connectIndividualOutputs(newAnalysers);

    const render = () => {
      const newVolumeLevels = newAnalysers.map((analyser) => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const value = Math.round(
          dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
        );
        return value;
      });

      setAudioGain(newVolumeLevels);
      requestAnimationFrame(() => setTimeout(() => render(), 100));
    };
    render();
  };

  const setup = async () => {
    const myAudio = await loadAudioContext();
    if (!myAudio) {
      return;
    }
    const spessasynth = await loadSoundFontPlayer(myAudio);
    if (!spessasynth) {
      return;
    }
    const player = await loadPlayer(spessasynth);
    loadSoundMeter(spessasynth, myAudio);
    setAudio(myAudio);
    setSynth(spessasynth);
    setPlayer(player);
    synthProgramChange(spessasynth);
    await myAudio.resume();
  };

  useEffect(() => {
    if (superUserConnections.length > 0) {
      sendSuperUserMessage(audioGain, "GIND_NODE");
    }
  }, [audioGain, superUserConnections]);

  return (
    <SpessasynthContext.Provider
      value={{
        audio: audio,
        audioGain: audioGain,
        setupSpessasynth: setup,
        synth: synth,
        player: player,
        instrument: instrument,
      }}
    >
      <>{children}</>
    </SpessasynthContext.Provider>
  );
};
