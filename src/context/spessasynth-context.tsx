"use client";
import { DEFAULT_SOUND_FONT } from "@/config/value";
import { createContext, FC, useEffect, useRef, useState } from "react";
import { Sequencer, Synthetizer, WORKLET_URL_ABSOLUTE } from "spessasynth_lib";
import { useRemote } from "../hooks/peer-hook";
import React from "react";

type SpessasynthContextType = {
  setupSpessasynth: () => Promise<void>;
  setSoundFontName: (name: string) => void;
  audioGain: number[];
  instrument: number[];
  synth: Synthetizer | undefined;
  player: Sequencer | undefined;
  audio: AudioContext | undefined;
  analysers: AnalyserNode[];
  perset: IPersetSoundfont[];
  defaultSoundFont: File | undefined;
  SFname: string | undefined;
};

type SpessasynthProviderProps = {
  children: React.ReactNode;
};

export const SpessasynthContext = createContext<SpessasynthContextType>({
  setupSpessasynth: async () => undefined,
  setSoundFontName: () => undefined,
  audioGain: [],
  instrument: [],
  synth: undefined,
  player: undefined,
  audio: undefined,
  analysers: [],
  perset: [],
  defaultSoundFont: undefined,
  SFname: undefined,
});

export const SpessasynthProvider: FC<SpessasynthProviderProps> = ({
  children,
}) => {
  const { sendSuperUserMessage, superUserConnections } = useRemote();
  const [synth, setSynth] = useState<Synthetizer>();
  const [player, setPlayer] = useState<Sequencer>();
  const [audio, setAudio] = useState<AudioContext>();
  const [perset, setPerset] = useState<IPersetSoundfont[]>([]);
  // Display
  const audioGain = useRef<number[]>([]);
  const [instrument, setInstrument] = useState<number[]>([]);
  const [analysers, setAnalysers] = useState<AnalyserNode[]>([]);
  const [defaultSoundFont, setDefaultSoundFont] = useState<File>();
  const [SFname, setSFName] = useState<string>();

  const loadPlayer = async (synth: Synthetizer) => {
    const seq = new Sequencer([], synth);
    seq.loop = false;
    return seq;
  };

  const setSoundFontName = (name: string) => {
    setSFName(name);
  };

  const loadSoundFontPlayer = async (audio: AudioContext) => {
    const res = await fetch(DEFAULT_SOUND_FONT);
    const ab = await res.arrayBuffer();
    const synthInstance = new Synthetizer(audio.destination, ab);

    synthInstance.eventHandler.addEvent(
      "presetlistchange",
      "",
      (event: IPersetSoundfont[]) => {
        let sort = event.sort((a, b) => a.program - b.program);
        sort = sort.filter((x, i) => i !== 1);
        setPerset(sort);
      }
    );

    // Default Setting
    synthInstance.setMainVolume(0.5);
    synthInstance.highPerformanceMode = false;

    const blob = new Blob([ab], { type: "application/octet-stream" });

    let sf = new File([blob], "soundfont.sf2", {
      type: "application/octet-stream",
    });
    setDefaultSoundFont(sf);

    setSoundFontName("soundfont เริ่มต้น.sf2");

    await synthInstance.isReady;
    return synthInstance;
  };

  const loadAudioContext = async (): Promise<AudioContext | undefined> => {
    if (typeof window !== "undefined") {
      try {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();

        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        await audioContext.audioWorklet.addModule(
          new URL(WORKLET_URL_ABSOLUTE, window.location.origin).toString()
        );

        return audioContext;
      } catch (error) {
        console.error(
          "Error loading AudioContext or adding audio worklet:",
          error
        );
        return undefined;
      }
    } else {
      console.warn(
        "AudioContext cannot be loaded in this environment (not in browser)."
      );
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
    }
    synth.connectIndividualOutputs(newAnalysers);
    setAnalysers(newAnalysers);
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

    // if (myAudio.state === "suspended") {
    //   await myAudio.resume();
    // }
  };

  useEffect(() => {
    if (superUserConnections.length > 0) {
      sendSuperUserMessage(audioGain, "GIND_NODE");
    }
  }, [audioGain, superUserConnections]);

  return (
    <SpessasynthContext.Provider
      value={{
        setupSpessasynth: setup,
        setSoundFontName: setSoundFontName,
        audio: audio,
        audioGain: audioGain.current,
        synth: synth,
        player: player,
        instrument: instrument,
        analysers: analysers,
        perset: perset,
        defaultSoundFont: defaultSoundFont,
        SFname: SFname,
      }}
    >
      <>{children}</>
    </SpessasynthContext.Provider>
  );
};
