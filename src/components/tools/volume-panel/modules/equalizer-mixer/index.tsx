import Button from "@/components/common/button/button";
import WinboxModal from "@/components/common/modal";
import React, { useState } from "react";
import { FaList } from "react-icons/fa";
import DrumPanel from "../drum-mixer/drum-panel";
import GlobalEqualizer from "./global-equalizer";

interface EqualizerProps {}

const EqualizerPanel: React.FC<EqualizerProps> = ({}) => {
  const [open, setOpen] = useState<boolean>(false);
  const openMixer = () => {
    setOpen(!open);
  };

  return (
    <>
      <WinboxModal
        onClose={() => setOpen(false)}
        title="Globals Equalizer"
        isOpen={open}
        height={580}
      >
        <GlobalEqualizer></GlobalEqualizer>
      </WinboxModal>
      <Button
        className="text-white"
        shadow=""
        onClick={openMixer}
        icon={<FaList></FaList>}
        border="border blur-border"
        padding="p-1 px-2"
        iconPosition="left"
      >
        Equalizer
      </Button>
    </>
  );
};

export default EqualizerPanel;
