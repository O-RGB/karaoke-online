import Button from "@/components/common/button/button";
import WinboxModal from "@/components/common/modal";
import React, { useEffect, useId, useState } from "react";
import { RxMixerVertical } from "react-icons/rx";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import DrumProgramChange from "./modules/drum-program";
import MixerNodes from "./modules/node";
import { DRUM_CHANNEL } from "@/config/value";
import { BaseSynthEngine } from "@/features/engine/types/synth.type";
import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";

interface FullMixerProps {
  nodes: SynthChannel[];
}

const FullMixer: React.FC<FullMixerProps> = ({ nodes }) => {
  const componentId = useId();

  const instrumental = useSynthesizerEngine(
    (state) => state.engine?.instrumental
  );
  const [program, setProgarm] = useState<number>(0);

  const [open, setOpen] = useState<boolean>(false);
  const openMixer = () => {
    setOpen(!open);
  };

  useEffect(() => {
    if (!nodes) return;
    if (nodes.length < DRUM_CHANNEL) return;

    const drumNode = nodes[DRUM_CHANNEL];
    drumNode.setCallBackState?.(
      ["PROGARM", "CHANGE"],
      DRUM_CHANNEL,
      (value) => {
        setProgarm(value.value);
      },
      componentId
    );

    return () => {
      drumNode.removeCallState?.(
        ["PROGARM", "CHANGE"],
        DRUM_CHANNEL,
        componentId
      );
    };
  }, [nodes]);

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
          <DrumProgramChange program={program}></DrumProgramChange>
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
