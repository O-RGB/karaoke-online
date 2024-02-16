import { Slider } from "antd";
import React, { useEffect, useRef, useState } from "react";
import LevelMeter from "./sound-level";

interface SoundBarProps {
  onChangeValueBar?: (ch: number, value: number) => void;
  index: number;
  soundPlayer: IChannel;
  callback?: (funcCallBack: (number: number, velocity: number) => void) => void;
}

const SoundBar: React.FC<SoundBarProps> = ({
  onChangeValueBar,
  index,
  soundPlayer,
  callback,
}) => {
  const [level, setLevel] = useState<number | undefined>(undefined);
  const [velocity, setvelocity] = useState<number | undefined>(undefined);

  const funcCallBack = (number: number, velocity: number) => {
    setLevel(number);
    setvelocity(velocity);

    if (velocity == 0) {
      setLevel(undefined);
      setvelocity(undefined);
    } else {
      setTimeout(() => {
        setLevel(undefined);
        setvelocity(undefined);
      }, 10);
    }
  };

  useEffect(() => {
    callback?.(funcCallBack);
  }, [callback]);
  return (
    <div className="relative h-full pt-2">
      <div className=" h-full z-50 relative ">
        <Slider
          vertical
          defaultValue={100}
          onChange={(value) => {
            onChangeValueBar?.(index, value);
          }}
        />
      </div>

      <div className={`absolute flex -bottom-1.5 w-full h-full z-10 duration-300`}>
        <LevelMeter
          up={velocity != undefined}
          inputVolume={velocity}
        ></LevelMeter>
      </div>
    </div>
  );
};

export default SoundBar;
