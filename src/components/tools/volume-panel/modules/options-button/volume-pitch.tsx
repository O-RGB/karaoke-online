import NumberButton from "@/components/common/input-data/number-button";
import SwitchButton from "@/components/common/input-data/switch/switch-button";
import { MAIN_VOLUME } from "@/features/engine/types/node.type";
import React, { useEffect } from "react";
import { FaList } from "react-icons/fa";
import { IoSpeedometerSharp } from "react-icons/io5";
import {
  PiMicrophoneStageFill,
  PiUserSoundFill,
  PiUserMinusFill,
} from "react-icons/pi";
import FullMixer from "../full-mixer";
import {
  BaseSynthEngine,
  IControllerChange,
} from "@/features/engine/types/synth.type";
import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";

interface VolumeOptionsProps {
  onPitchChange: (value: number) => void;
  onSpeedChange: (value: number) => void;
  openQueue?: () => void;
  onMutedVolume: (event: IControllerChange<boolean>) => void;
  setNotification: (notification: INotificationValue) => void;
  vocal: number;
  nodes?: SynthChannel[];
}

const VolumeOptions: React.FC<VolumeOptionsProps> = ({
  onPitchChange,
  onSpeedChange,
  openQueue,
  onMutedVolume,
  setNotification,
  vocal,
  nodes,
}) => {
  useEffect(() => {}, [nodes]);
  return (
    <>
      <div className="flex gap-2 justify-between lg:justify-normal w-full">
        <NumberButton
          className="!w-full lg:!w-fit"
          onChange={(value) => {
            onPitchChange(value);
            setNotification({ text: `Pitch ${value}` });
          }}
          value={0}
          icon={
            <PiMicrophoneStageFill className="text-[15px]"></PiMicrophoneStageFill>
          }
        ></NumberButton>
        <NumberButton
          className="!w-full lg:!w-fit"
          onChange={(value) => {
            onSpeedChange(value);
            setNotification({ text: `Speed ${value}` });
          }}
          value={100}
          icon={
            <IoSpeedometerSharp className="text-[15px]"></IoSpeedometerSharp>
          }
        ></NumberButton>
        <SwitchButton
          className="!w-full lg:!w-fit"
          onChange={(muted) => {
            onMutedVolume({
              channel: vocal,
              controllerNumber: MAIN_VOLUME,
              controllerValue: !muted,
            });
          }}
          iconOpen={<PiUserSoundFill className="text-lg"></PiUserSoundFill>}
          iconClose={<PiUserMinusFill className="text-lg"></PiUserMinusFill>}
          colorClose="red"
        ></SwitchButton>

        <SwitchButton
          className="!w-full lg:!w-fit hidden lg:block "
          onChange={openQueue}
          iconOpen={<FaList></FaList>}
          iconClose={<FaList></FaList>}
        ></SwitchButton>

        {nodes && <FullMixer nodes={nodes}></FullMixer>}
      </div>
    </>
  );
};

export default VolumeOptions;
