import React from "react";

import { channel } from "diagnostics_channel";
import RangeBar from "../range-bar";

interface VolumeMeterProps {
  level: number;
  channel: number;
  onChange?: (channel: number, value: number) => void;
}

const VolumeMeter: React.FC<VolumeMeterProps> = ({
  level,
  channel,
  onChange,
}) => {
  const maxLevel = 15;
  const filledBars = Math.round((level / 127) * maxLevel);

  const onVolumeMeterChange = (value: number = 0) => {
    onChange?.(channel - 1, value);
  };

  return (
    <div className="w-fit">
      <div className="w-full bg-slate-600 text-center text-white font-bold ">
        {channel}
      </div>
      <div className="flex gap-1.5 p-2 bg-slate-700">
        <RangeBar
          defaultValue={100}
          max={127}
          min={0}
          onRangeChange={onVolumeMeterChange}
        ></RangeBar>
        <div className="flex flex-col items-center">
          {[...Array(maxLevel)].map((_, index) => {
            let bgColor = "bg-red-500";
            if (index >= maxLevel - 9) bgColor = "bg-green-500";
            else if (index >= maxLevel - 13) bgColor = "bg-yellow-500";

            return (
              <div
                key={index}
                className={`w-3 h-1 mb-0.5 ${bgColor}`}
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
