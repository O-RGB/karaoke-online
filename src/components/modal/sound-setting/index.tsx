import Tabs from "@/components/common/tabs";
import React from "react";
import MidiSettingModal from "./midi-setting-modal";
import { SiMidi } from "react-icons/si";
import LockSoundModal from "./lock-sound-modal";
import { FaLock } from "react-icons/fa";
import EngineSoundModal from "./engine-sound-modal";
import { PiEngineFill } from "react-icons/pi";
import InstrumentalModal from "./instrumental";
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
          {
            content: <EngineSoundModal></EngineSoundModal>,
            label: "Engine",
            icon: <PiEngineFill></PiEngineFill>,
          },
        ]}
      ></Tabs>
    </>
  );
};

export default SoundSettingModal;
