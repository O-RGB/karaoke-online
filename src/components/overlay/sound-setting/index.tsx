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
  const channel = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  return (
    <div
      className={`w-fit h-full border ${rounded} ${bgOverLay} ${blur} ${textColor} ${borderColor} p-2 relative`}
    >
      <div className="flex h-36 z-50 w-fit p-2">
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
              <div className="pt-2">{index + 1}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SoundSetting;
