import React, { useEffect, useState } from "react";
import RangeBar from "../input-data/range-bar";
import { getIconInstruments } from "@/lib/spssasynth/icons-instruments";
import { FaDrum } from "react-icons/fa";
import { PiMicrophoneStageFill } from "react-icons/pi";
import { BiSolidVolumeFull, BiSolidVolumeMute } from "react-icons/bi";

interface VolumeMeterProps {
  value?: number;
  level: number;
  channel: number;
  instruments: number;
  isLock: boolean;
  onChange?: (channel: number, value: number) => void;
  onLock?: (channel: number) => void;
  onMouseUp?: () => void;
  onTouchEnd?: () => void;
}

const VolumeMeter: React.FC<VolumeMeterProps> = ({
  value = 100,
  level,
  channel,
  instruments,
  isLock,
  onChange,
  onLock,
  onMouseUp,
  onTouchEnd,
}) => {
  const maxLevel = 100;

  const [filledBars, setFilledBars] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0);

  const onVolumeMeterChange = (value: number = 0) => {
    onChange?.(channel - 1, value);
    setVolume(value);
  };

  const onLockVolume = () => {
    onLock?.(channel);
  };

  useEffect(() => {
    setFilledBars(Math.round((level / 150) * maxLevel));
  }, [level]);

  useEffect(() => {
    setVolume(value);
  }, [value]);

  return (
    <div className="flex flex-col items-center justify-center w-full lg:w-fit">
      <div
        onClick={onLockVolume}
        className={`${
          isLock ? "bg-red-500 hover:bg-red-500/50" : "hover:bg-white/30"
        } w-full text-center text-white font-bold text-[10px] flex items-center justify-center gap-[1px] rounded-t-md  duration-300 cursor-pointer `}
      >
        <span className="pt-0.5">
          {isLock ? (
            <BiSolidVolumeMute></BiSolidVolumeMute>
          ) : (
            <BiSolidVolumeFull></BiSolidVolumeFull>
          )}
        </span>
        <span>{channel}</span>
      </div>
      <div className="relative w-full max-w-20">
        <div className="relative flex gap-1 p-1 h-24 w-full justify-center">
          <div className="absolute z-20 left-0 bottom-0 w-full h-24 grid opacity-30 rounded-t-md overflow-hidden">
            <div className="bg-white/90"></div>
            <div className="bg-white/60"></div>
            <div className="bg-white/30"></div>
          </div>
          <div
            className="absolute z-10 left-0 bottom-0 w-full bg-white/50 duration-75 transition-all"
            style={{
              height: isLock ? "" : `${(filledBars / maxLevel) * 100}%`,
            }}
          />
          <div className="relative z-20 flex items-center justify-center h-full">
            <RangeBar
              value={volume}
              max={127}
              min={0}
              onRangeChange={onVolumeMeterChange}
              inputProps={{
                tabIndex: -1,
                disabled: isLock,
                onMouseUp: onMouseUp,
                onTouchEnd: onTouchEnd,
              }}
            ></RangeBar>
          </div>
        </div>
      </div>
      <div className="min-w-full lg:min-w-7 border border-white/20">
        <div className="w-full blur-overlay text-center text-white font-bold text-[10px] p-1 flex justify-center items-center h-3.5">
          <>
            {channel === 10 ? (
              <FaDrum></FaDrum>
            ) : channel === 9 ? (
              <PiMicrophoneStageFill></PiMicrophoneStageFill>
            ) : (
              <>{getIconInstruments(instruments ?? 0)?.icon}</>
            )}
          </>
        </div>
      </div>
    </div>
  );
};

export default VolumeMeter;
