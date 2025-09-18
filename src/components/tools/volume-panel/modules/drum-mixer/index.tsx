import Button from "@/components/common/button/button";
import WinboxModal from "@/components/common/modal";
import React, { useState } from "react";
import { FaDrum } from "react-icons/fa";
import DrumPanel from "./drum-panel";

interface DrumMixerProps {}

const DrumMixer: React.FC<DrumMixerProps> = ({}) => {
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
        className="text-white"
        shadow=""
        onClick={openMixer}
        icon={<FaDrum></FaDrum>}
        border="border blur-border"
        padding="p-1 px-2"
        iconPosition="left"
      >
        กลอง
      </Button>
    </>
  );
};

export default DrumMixer;
