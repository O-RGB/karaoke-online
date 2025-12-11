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
      engine?.timerUpdated.on(
        ["TIMING", "CHANGE"],
        0,
        onTickUpdated,
        componnetId
      );
      engine?.tempoUpdated.on(
        ["TEMPO", "CHANGE"],
        0,
        onTempoUpdated,
        componnetId
      );
      engine?.musicUpdated.on(
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
    <div className="blur-overlay blur-border border rounded-md h-[35px] w-32 text-white">
      <div className="flex items-center justify-between h-full px-2">
        <div className="flex mb-1">
          {String(Math.round(tempo)).padStart(3, "0")}
        </div>
        <div className="flex gap-1">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index !== currentBeatInBar - 1 ? "bg-white/30" : "bg-white"
              }`}
            ></div>
          ))}
        </div>
        <div className="flex mb-1">{currentBeatInBar}:4</div>
      </div>
    </div>
  );
};

export default TempoPanel;
