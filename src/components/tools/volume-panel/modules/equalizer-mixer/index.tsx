import Button from "@/components/common/button/button";
import WinboxModal from "@/components/common/modal";
import GlobalEqualizer from "./global-equalizer";
import React, { useState } from "react";
import { FaList } from "react-icons/fa";
import GlobalEqualizerModal from "@/components/modal/display/equalizer/global-equalizer";

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
        // height={580}
      >
        <GlobalEqualizerModal></GlobalEqualizerModal>
      </WinboxModal>
      <Button
        size="xs"
        blur={{ border: true }}
        onClick={openMixer}
        icon={<FaList></FaList>}
      >
        Equalizer
      </Button>
    </>
  );
};

export default EqualizerPanel;
