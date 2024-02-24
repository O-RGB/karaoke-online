import React, { useEffect, useState } from "react";
import usePlayer from "../../../../hooks/usePlayer";

interface TempoProps {
  rounded?: string;
  bgOverLay?: string;
  blur?: string;
  textColor?: string;
  borderColor?: string;
}

const Tempo: React.FC<TempoProps> = ({
  rounded,
  bgOverLay,
  blur,
  textColor,
  borderColor,
}) => {
  const player = usePlayer();

  const [tempoRun, setRun] = useState<boolean>(false);
  const [note, setNote] = useState<number>(0);
  const [interval, setRunner] = useState<any>();

  const start = (time: number) => {
    const run = setInterval(() => {
      console.log("runner");
      setNote((value) => {
        if (value == 4) {
          return 1;
        }
        return value + 1;
      });
    }, time);
    setRunner(run);
  };
  useEffect(() => {
    if (player.playing && player.bpm != 0) {
      setRun(true);
      start(((player.bpm / 60) * 1000));
    } else {
      setNote(0);
      setRun(false);
      clearInterval(interval);
    }
  }, [player.playing, player.bpm]);
  return (
    <>
      <div
        className={`${rounded} ${bgOverLay} ${blur} ${textColor} ${borderColor} w-32 md:w-64 h-12 md:h-20   duration-300 p-2`}
      >
        <div className="w-full  h-full flex flex-col">
          <div className="h-full text-4xl flex justify-between items-center">
            <div className="font-bold">{player.bpm}</div>
          </div>
          <div className="h-6  flex gap-1">
            <div className={`w-full ${note == 1 ? "bg-white/50" : ""}`}></div>
            <div className={`w-full ${note == 2 ? "bg-white/50" : ""}`}></div>
            <div className={`w-full ${note == 3 ? "bg-white/50" : ""}`}></div>
            <div className={`w-full ${note == 4 ? "bg-white/50" : ""}`}></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tempo;
