import NumberButton from "@/components/common/input-data/number-button";
import SwitchButton from "@/components/common/input-data/switch/switch-button";
import FullMixer from "../full-mixer";
import DrumMixer from "../drum-mixer";
import Button from "@/components/common/button/button";
import EqualizerPanel from "../equalizer-mixer";
import useConfigStore from "@/features/config/config-store";
import ButtonCommon from "@/components/common/button/button";
import React, { useEffect, useId, useState } from "react";
import { IoSpeedometerSharp } from "react-icons/io5";
import { MAIN_VOLUME } from "@/features/engine/types/node.type";
import { FaList } from "react-icons/fa";
import { IControllerChange } from "@/features/engine/types/synth.type";
import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import { Menu, MenuButton } from "@szhsin/react-menu";
import { CgOptions } from "react-icons/cg";
import {
  PiMicrophoneStageFill,
  PiUserSoundFill,
  PiUserMinusFill,
} from "react-icons/pi";
import { useSynthesizerEngine } from "@/features/engine/synth-store";

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
  const componnetId = useId();
  const engine = useSynthesizerEngine((state) => state.engine);

  const [speed, setSpeed] = useState<number>(100);
  const [pitch, setPitch] = useState<number>(0);

  useEffect(() => {
    if (engine) {
      engine?.speedUpdated.add(["SPEED", "CHANGE"], 0, setSpeed, componnetId);
      engine?.pitchUpdated.add(["PITCH", "CHANGE"], 0, setPitch, componnetId);
    }
  }, [nodes, engine]);
  return (
    <div className="flex gap-2">
      <NumberButton
        onChange={(value) => {
          onPitchChange(value);
          setPitch(value);
          setNotification({ text: `Pitch ${value}` });
        }}
        value={pitch}
        icon={
          <PiMicrophoneStageFill className="text-[15px]"></PiMicrophoneStageFill>
        }
      ></NumberButton>

      <NumberButton
        onChange={(value) => {
          onSpeedChange(value);
          setSpeed(value);
          setNotification({ text: `Speed ${value}` });
        }}
        value={speed}
        icon={<IoSpeedometerSharp className="text-[15px]"></IoSpeedometerSharp>}
      ></NumberButton>

      <SwitchButton
        className="!rounded-[4px] !p-2"
        onChange={(muted) => {
          onMutedVolume({
            channel: vocal,
            controllerNumber: MAIN_VOLUME,
            controllerValue: !muted,
          });
        }}
        iconOpen={<PiUserSoundFill></PiUserSoundFill>}
        iconClose={<PiUserMinusFill></PiUserMinusFill>}
        colorClose="danger"
      ></SwitchButton>

      <Menu
        transition
        boundingBoxPadding="10 10 10 10"
        className={"szh-menu-custom !bg-black/20"}
        menuButton={() => {
          return (
            <MenuButton>
              <ButtonCommon
                className="!rounded-[4px] !p-2"
                blur={{ border: true, backgroundColor: "primary" }}
              >
                <CgOptions></CgOptions>
              </ButtonCommon>
            </MenuButton>
          );
        }}
      >
        <div className="px-2 ">
          <div className="flex flex-col gap-2">
            <Button
              size="xs"
              onClick={openQueue}
              icon={<FaList></FaList>}
              blur={{ border: true }}
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
  );
};

export default VolumeOptions;
