import React, { useEffect, useId, useState } from "react";
import useConfigStore from "../../features/config/config-store";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { MusicLoadAllData } from "@/features/songs/types/songs.type";
import { IMidiParseResult } from "@/lib/karaoke/songs/midi/types";

interface TempoPanelProps {}

const TempoPanel: React.FC<TempoPanelProps> = ({}) => {
  const componnetId = useId();
  const engine = useSynthesizerEngine((state) => state.engine);

  const [tick, setTick] = useState<number>(0);
  const [tempo, setTempo] = useState<number>(0);
  const [musicInfo, setMusicInfo] = useState<MusicLoadAllData>();

  const onTickUpdated = (tick: number) => {
    setTick(tick);
  };

  const onTempoUpdated = (tempo: number) => {
    setTempo(tempo);
  };

  const onMusicUpdated = (music: MusicLoadAllData) => {
    setMusicInfo(music);
  };

  useEffect(() => {
    if (engine) {
      engine?.timerUpdated.add(
        ["TIMING", "CHANGE"],
        0,
        onTickUpdated,
        componnetId
      );
      engine?.tempoUpdated.add(
        ["TEMPO", "CHANGE"],
        0,
        onTempoUpdated,
        componnetId
      );
      engine?.musicUpdated.add(
        ["MUSIC", "CHANGE"],
        0,
        onMusicUpdated,
        componnetId
      );
    }
  }, [engine]);

  const config = useConfigStore((state) => state.config);
  const widgetConfig = config.widgets;
  let isShow = widgetConfig?.tempo?.show;

  const [currentBeatInBar, setCurrentBeatInBar] = useState(1);

  useEffect(() => {
    if (isShow && musicInfo?.musicType === "MIDI") {
      const ppq = (musicInfo.metadata as IMidiParseResult).ticksPerBeat;
      if (tick > 0 && ppq > 0) {
        const currentTickInBar = tick % (ppq * 4);
        const beatInBar = Math.floor(currentTickInBar / ppq) + 1;
        setCurrentBeatInBar(beatInBar);
      }
    }
  }, [musicInfo, isShow ? tick : undefined]);

  if (isShow === false) {
    return null;
  }
  return (
    <div className="blur-overlay blur-border border rounded-md p-2 w-44 hidden lg:block text-white">
      <div className="flex justify-between items-center mb-1">
        <span className=" text-xl font-bold">{Math.round(tempo)}</span>
        <span className=" text-xl font-bold">{currentBeatInBar}:4</span>
      </div>
      <div className="relative w-full h-1 bg-white/50 mb-2">
        <div className="absolute top-0 left-0 h-full w-full"></div>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={`h-2 ${
              index !== currentBeatInBar - 1 ? "bg-white/30" : "bg-white"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default TempoPanel;
