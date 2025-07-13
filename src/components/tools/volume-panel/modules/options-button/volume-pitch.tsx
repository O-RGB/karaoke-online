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
import DrumMixer from "../drum-mixer";
import { Menu, MenuButton } from "@szhsin/react-menu";
import Button from "@/components/common/button/button";
import { CgOptions } from "react-icons/cg";
import EqualizerPanel from "../equalizer-mixer";
import useConfigStore from "@/features/config/config-store";

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
  const engineMode = useConfigStore((state) => state.config.system?.engine);
  useEffect(() => {}, [nodes]);
  return (
    <>
      <div className="flex gap-2 w-full overflow-auto">
        <NumberButton
          onChange={(value) => {
            onPitchChange(value);
            setNotification({ text: `Pitch ${value}` });
          }}
          value={0}
          icon={
            <PiMicrophoneStageFill className="text-[15px]"></PiMicrophoneStageFill>
          }
        ></NumberButton>
        {engineMode === "spessa" && (
          <NumberButton
            onChange={(value) => {
              onSpeedChange(value);
              setNotification({ text: `Speed ${value}` });
            }}
            value={100}
            icon={
              <IoSpeedometerSharp className="text-[15px]"></IoSpeedometerSharp>
            }
          ></NumberButton>
        )}

        <SwitchButton
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

        <Menu
          transition
          boundingBoxPadding="10 10 10 10"
          className={"szh-menu-custom"}
          menuButton={(open) => {
            return (
              <MenuButton>
                <Button
                  className="text-white"
                  shadow=""
                  border="border blur-border"
                  padding="p-2 px-2"
                >
                  <CgOptions></CgOptions>
                </Button>
              </MenuButton>
            );
          }}
        >
          <div className="px-2 ">
            <div className="flex flex-col gap-2">
              <Button
                className="text-white"
                shadow=""
                onClick={openQueue}
                icon={<FaList></FaList>}
                border="border blur-border"
                padding="p-1 px-2"
                iconPosition="left"
              >
                คิวเพลง
              </Button>
              {nodes && <FullMixer nodes={nodes}></FullMixer>}
              {nodes && <DrumMixer></DrumMixer>}
              <EqualizerPanel></EqualizerPanel>
            </div>
          </div>
        </Menu>
      </div>
    </>
  );
};

export default VolumeOptions;
