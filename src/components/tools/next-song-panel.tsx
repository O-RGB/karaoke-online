import useQueuePlayer from "@/features/player/player/modules/queue-player";
import React, { useEffect, useId, useState } from "react";
import { ITrackData } from "@/features/songs/types/songs.type";
import { useSynthesizerEngine } from "@/features/engine/synth-store";

interface NextSongPanelProps {
  className?: string;
}

const NextSongPanel: React.FC<NextSongPanelProps> = ({ className }) => {
  const componnetId = useId();
  const engine = useSynthesizerEngine((state) => state.engine);
  const [countdown, setCountDown] = useState<number>(0);

  const onCountDownUpdated = (tempo: number) => {
    setCountDown(tempo);
  };

  useEffect(() => {
    if (engine) {
      engine?.countdownUpdated.on(
        ["COUNTDOWN", "CHANGE"],
        0,
        onCountDownUpdated,
        componnetId
      );
    }
    return () => {
      engine?.countdownUpdated.off(["COUNTDOWN", "CHANGE"], 0, componnetId);
    };
  }, [engine]);

  const queue = useQueuePlayer((state) => state.queue);
  const [saveInfo, setInfo] = useState<ITrackData>();

  useEffect(() => {
    if (queue.length > 0 && countdown <= 3) {
      setInfo(queue[0]);
    } else if (queue.length === 1) {
      setInfo(undefined);
    }
  }, [countdown]);

  if (countdown > 3 || queue.length < 1 || !saveInfo) {
    return <></>;
  }

  return (
    <div className={`${className}`}>
      <div
        className={`w-full h-20 px-6 lg:px-20 flex flex-col justify-center items-center gap-2`}
      >
        <div className=" flex justify-center gap-3 lg:gap-10">
          <div
            className={`${
              countdown <= 3 ? "bg-white/70" : "bg-white/20"
            } w-5 lg:w-10 h-5 lg:h-10 rounded-full border flex items-center justify-center text-xs lg:text-xl font-bold text-white`}
          >
            3
          </div>
          <div
            className={`${
              countdown <= 2 ? "bg-white/70" : "bg-white/20"
            } w-5 lg:w-10 h-5 lg:h-10 rounded-full border flex items-center justify-center text-xs lg:text-xl font-bold text-white`}
          >
            2
          </div>
          <div
            className={`${
              countdown <= 1 ? "bg-white/70" : "bg-white/20"
            } w-5 lg:w-10 h-5 lg:h-10 rounded-full border flex items-center justify-center text-xs lg:text-xl font-bold text-white`}
          >
            1
          </div>
        </div>
        <div className="lg:text-xl text-white text-center leading-none lg:leading-normal">
          <span>{saveInfo?.TITLE}</span>
          <br />
          <span className="text-xs lg:text-base">{saveInfo?.ARTIST}</span>
        </div>
      </div>
    </div>
  );
};

export default NextSongPanel;
