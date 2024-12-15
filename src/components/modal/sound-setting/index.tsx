import Tabs from "@/components/common/tabs";
import React from "react";
import MidiSettingModal from "./midi-setting-modal";
import { SiMidi } from "react-icons/si";
import LockSoundModal from "./lock-sound-modal";
import { FaLock } from "react-icons/fa";
import EngineSoundModal from "./engine-sound-modal";
import { PiEngineFill } from "react-icons/pi";

interface SoundSettingModalProps {}

const SoundSettingModal: React.FC<SoundSettingModalProps> = ({}) => {
  return (
    <>
      <Tabs
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
