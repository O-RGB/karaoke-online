import React, { useEffect, useState } from "react";

import { channel } from "diagnostics_channel";
import RangeBar from "../range-bar";
import { useMixer } from "@/app/hooks/mixer-hooks";

interface VolumeMeterProps {
  value?: number;
  level: number;
  channel: number;
  onChange?: (channel: number, value: number) => void;
}

const VolumeMeter: React.FC<VolumeMeterProps> = ({
  value = 100,
  level,
  channel,
  onChange,
}) => {
  const maxLevel = 25;

  const [filledBars, setFilledBars] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0);

  const onVolumeMeterChange = (value: number = 0) => {
    onChange?.(channel - 1, value);
    setVolume(value);
  };

  useEffect(() => {
    setFilledBars(Math.round((level / 127) * maxLevel));
  }, [level]);

  useEffect(() => {
    setVolume(value);
  }, [value]);

  return (
    <div className="w-fit">
      <div className="w-full bg-slate-600 text-center text-white font-bold ">
        {channel}
      </div>
      <div className="flex gap-1.5 p-2 bg-slate-700">
        <RangeBar
          value={volume}
          max={127}
          min={0}
          onRangeChange={onVolumeMeterChange}
        ></RangeBar>
        <div className="flex flex-col items-center">
          {[...Array(maxLevel)].map((_, index) => {
            let bgColor = "bg-red-500";
            if (index >= maxLevel - 14) bgColor = "bg-green-500";
            else if (index >= maxLevel - 20) bgColor = "bg-yellow-500";

            return (
              <div
                key={index}
                className={`w-3 h-[0.18rem] mb-[0.2rem] ${bgColor}`}
                style={{ opacity: index >= maxLevel - filledBars ? 1 : 0.2 }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VolumeMeter;
