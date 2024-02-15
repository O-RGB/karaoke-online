import React, { useState } from "react";
import usePlayer from "../../../hooks/usePlayer";
import { Slider } from "antd";
import SoundBar from "./sound-bar";
import LevelMeter from "./sound-level";

interface SoundSettingProps {
  rounded?: string;
  bgOverLay?: string;
  textColor?: string;
  borderColor?: string;
  blur?: string;
}

const SoundSetting: React.FC<SoundSettingProps> = ({
  bgOverLay,
  blur,
  borderColor,
  rounded,
  textColor,
}) => {
  const player = usePlayer();
  const channel = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const [level, setleevel] = useState<number | undefined>(undefined);
  return (
    <div
      className={`w-full border ${rounded} ${bgOverLay} ${blur} ${textColor} ${borderColor} p-2 relative`}
    >
      <div
        onClick={() => {
          setleevel(0.5);
          setTimeout(() => {
            setleevel(undefined);
          }, 100);
        }}
      >
        test
      </div>

      <div className="flex h-24 md:h-36 z-50 w-full">
        {channel.map((data, index) => {
          return (
            <div
              key={`ch-${index}`}
              className="flex flex-col justify-center items-center  relative"
            >
              {player.sound && (
                <SoundBar
                  index={index}
                  soundPlayer={player.sound[index]}
                  onChangeValueBar={(ch, value) => {
                    player.settingSound(ch, value);
                  }}
                  callback={(e) => {
                    player.setSoundFun(index, e);
                  }}
                ></SoundBar>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SoundSetting;
