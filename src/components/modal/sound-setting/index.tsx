import Tabs from "@/components/common/tabs";
import React from "react";
import MidiSettingModal from "./tabs/midi-output";
import { SiMidi } from "react-icons/si";
import LockSoundModal from "./tabs/lock-sound";
import { FaLock } from "react-icons/fa";
import EngineSoundModal from "./tabs/engine-setting";
import { PiEngineFill } from "react-icons/pi";
import InstrumentalModal from "./tabs/instrumental";
import { GiGuitar } from "react-icons/gi";

interface SoundSettingModalProps {
  height?: number;
}

const SoundSettingModal: React.FC<SoundSettingModalProps> = ({ height }) => {
  return (
    <>
      <Tabs
        height={height}
        tabs={[
          {
            content: <MidiSettingModal></MidiSettingModal>,
            label: "Midi output",
            icon: <SiMidi></SiMidi>,
          },
          {
            content: <LockSoundModal></LockSoundModal>,
            label: "ล็อกเสียง",
            icon: <FaLock></FaLock>,
          },
          {
            content: <InstrumentalModal></InstrumentalModal>,
            label: "อุปกรณ์เสียง",
            icon: <GiGuitar></GiGuitar>,
          },
          // {
          //   content: <EngineSoundModal></EngineSoundModal>,
          //   label: "Engine",
          //   icon: <PiEngineFill></PiEngineFill>,
          // },
        ]}
      ></Tabs>
    </>
  );
};

export default SoundSettingModal;
