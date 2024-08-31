import React, { useEffect, useState } from "react";
import RangeBar from "../input-data/range-bar";
import { MdPiano } from "react-icons/md";
import { getIconInstruments } from "@/lib/spssasynth/icons-instruments";

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
  const maxLevel = 30;

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
      <div className="w-full text-center text-white font-bold  text-xs">
        {channel}
      </div>
      <div className="relative w-full max-w-20">
        <div className="flex gap-1 p-1 h-24 w-full justify-center">
          <div className="absolute left-0 bottom-0 w-full">
            <div className="flex flex-col items-center w-full">
              {[...Array(maxLevel)].map((_, index) => {
                let bgColor = "bg-white"; // บน
                if (index >= maxLevel - 10) bgColor = "bg-white/50"; // ล่าง
                else if (index >= maxLevel - 20) bgColor = "bg-white/80"; // กลาง

                return (
                  <div
                    key={index}
                    className={`w-full h-[0.2rem] ${bgColor}`}
                    style={{
                      opacity: index >= maxLevel - filledBars ? 1 : 0.2,
                    }}
                  />
                );
              })}
            </div>
          </div>
          <div className="relative flex items-center justify-center h-full">
            <RangeBar
              value={volume}
              max={127}
              min={0}
              onRangeChange={onVolumeMeterChange}
            ></RangeBar>
          </div>
        </div>
      </div>
      <div className="border border-white/20 min-w-full lg:min-w-7 h-10">
        <div className="w-full blur-overlay text-center text-white font-bold text-xs">
          {instruments}
        </div>

        <div className="flex items-center justify-center p-1 hover:bg-white/30 duration-300 cursor-pointer border-white/30">
          <div className="text-xs text-white">
            {instruments ? getIconInstruments(instruments)?.icon : <></>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolumeMeter;
