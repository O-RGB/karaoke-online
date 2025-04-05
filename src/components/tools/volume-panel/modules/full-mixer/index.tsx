import Button from "@/components/common/button/button";
import WinboxModal from "@/components/common/modal";
import {
  INSTRUMENT_DRUM,
  INSTRUMENT_TYPE_BY_INDEX,
} from "@/features/engine/modules/instrumentals/instrumental";
import React, { useState } from "react";
import { RxMixerVertical } from "react-icons/rx";
import InstrumentalVolumeNode from "./modules/node/volume-node";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import DrumChange from "./modules/drum";
import MixerNodes from "./modules/node";

interface FullMixerProps {}

const FullMixer: React.FC<FullMixerProps> = ({}) => {
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
        title="Mixer"
        height={313}
        isOpen={open}
      >
        <div className="overflow-auto w-full h-full">
          {instrumental && (
            <MixerNodes instrumental={instrumental}></MixerNodes>
          )}
          <DrumChange></DrumChange>
        </div>
      </WinboxModal>
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
