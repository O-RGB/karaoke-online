import Button from "@/components/common/button/button";
import WinboxModal from "@/components/common/modal";
import React, { useState } from "react";
import { RxMixerVertical } from "react-icons/rx";

interface FullMixerProps {}

const FullMixer: React.FC<FullMixerProps> = ({}) => {
  const [open, setOpen] = useState<boolean>(false);
  const openMixer = () => {
    setOpen(!open);
  };

  return (
    <>
      <WinboxModal title="Mixer" height={300} isOpen={open}></WinboxModal>
      <Button
        className="!w-full lg:!w-fit"
        shadow=""
        onClick={openMixer}
        icon={<RxMixerVertical className="text-white"></RxMixerVertical>}
        border="border blur-border"
        padding="p-1 px-2"
      ></Button>
    </>
  );
};

export default FullMixer;
