import { Slider } from "antd";
import React, { useEffect, useRef, useState } from "react";
import LevelMeter from "./sound-level";

interface SoundBarProps {
  onChangeValueBar?: (ch: number, value: number) => void;
  index: number;
  soundPlayer: IChannel;
  callback?: (funcCallBack: (number: number) => void) => void;
}

const SoundBar: React.FC<SoundBarProps> = ({
  onChangeValueBar,
  index,
  soundPlayer,
  callback,
}) => {
  const [level, setLevel] = useState<number | undefined>(undefined);

  const funcCallBack = (number: number) => {
    setLevel(number);
    setTimeout(() => {
      // countBack();
      setLevel(undefined);
    }, 100);
  };

  useEffect(() => {
    callback?.(funcCallBack);
  }, [callback]);
  return (
    <>
      <div className="sm:p-2 h-full z-50 ">
        <Slider
          vertical
          defaultValue={100}
          onChange={(value) => {
            onChangeValueBar?.(index, value);
          }}
        />
      </div>
      <div>{index + 1}</div>

      <div
        className={`absolute flex bottom-6 w-full h-full bg-neutral-700 z-10 duration-300`}
      >
        <LevelMeter up={level != undefined} inputVolume={level}></LevelMeter>
      </div>
    </>
  );
};

export default SoundBar;
