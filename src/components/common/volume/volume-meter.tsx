import React, { useEffect, useState } from "react";
import RangeBar from "../input-data/range-bar";

interface VolumeMeterProps {
  value?: number;
  level: number;
  channel: number;
  instruments: number;
  onChange?: (channel: number, value: number) => void;
}

const VolumeMeter: React.FC<VolumeMeterProps> = ({
  value = 100,
  level,
  channel,
  instruments,
  onChange,
}) => {
  const maxLevel = 100;

  const [filledBars, setFilledBars] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0);

  const onVolumeMeterChange = (value: number = 0) => {
    onChange?.(channel - 1, value);
    setVolume(value);
  };

  useEffect(() => {
    setFilledBars(Math.round((level / 150) * maxLevel));
  }, [level]);

  useEffect(() => {
    setVolume(value);
  }, [value]);

  return (
    <div className="flex flex-col items-center justify-center w-full lg:w-fit">
      <div className="w-full text-center text-white font-bold text-xs">
        {channel}
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
              height: `${(filledBars / maxLevel) * 100}%`,
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
              }}
            ></RangeBar>
          </div>
        </div>
      </div>
      <div className="min-w-full lg:min-w-7 border border-white/20">
        <div className="w-full blur-overlay text-center text-white font-bold text-[9px]">
          {instruments ?? 0}
        </div>
      </div>
    </div>
  );
};

export default VolumeMeter;
