import Button from "@/components/common/button/button";
import WinboxModal from "@/components/common/modal";
import React, { useId, useState } from "react";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { FaDrum } from "react-icons/fa";
import DrumPanel from "./drum-panel";

interface DrumMixerProps {}

const DrumMixer: React.FC<DrumMixerProps> = ({}) => {
  const componentId = useId();

  const instrumental = useSynthesizerEngine(
    (state) => state.engine?.instrumental
  );

  const [open, setOpen] = useState<boolean>(false);
  const openMixer = () => {
    setOpen(!open);
  };

  return (
    <>
      <WinboxModal
        onClose={() => setOpen(false)}
        title="Drum"
        height={313}
        isOpen={open}
      >
        <div className="overflow-auto w-full h-full">
          <DrumPanel></DrumPanel>
        </div>
      </WinboxModal>
      <Button
        className="!w-full lg:!w-fit"
        shadow=""
        onClick={openMixer}
        icon={<FaDrum className="text-white"></FaDrum>}
        border="border blur-border"
        padding="p-1 px-2"
      ></Button>
    </>
  );
};

export default DrumMixer;
