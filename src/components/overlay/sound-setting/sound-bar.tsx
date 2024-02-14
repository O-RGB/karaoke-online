import { Slider } from "antd";
import React, { useEffect, useState } from "react";

interface SoundBarProps {
  onChangeValueBar?: (ch: number, value: number) => void;
  index: number;
  soundPlayer: IChannel;
}

const SoundBar: React.FC<SoundBarProps> = ({
  onChangeValueBar,
  index,
  soundPlayer,
}) => {
  const [level, setLevel] = useState<number | undefined>(undefined);
  useEffect(() => {
    setLevel(soundPlayer.level);
    if(index == 8){
        console.log("กลอง update")
    }
  }, [soundPlayer.level]);
  return (
    <>
      <div className="sm:p-2 h-full z-50">
        <Slider
          vertical
          defaultValue={100}
          onChange={(value) => {
            onChangeValueBar?.(index, value);
          }}
        />
      </div>
      <div>{index + 1}</div>
      {/* {level && (
        <div
          style={{
            height: `${level == 0 ? 0 : level - 35 < 0 ? 0 : level - 35}%`,
          }}
          className={`absolute flex bottom-6 w-full bg-neutral-700 z-10`}
        ></div>
      )} */}
      <div>{level}</div>
    </>
  );
};

export default SoundBar;
