import Button from "@/components/common/button/button";
import WinboxModal from "@/components/common/modal";
import React, { useEffect, useId, useState } from "react";
import { RxMixerVertical } from "react-icons/rx";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import DrumProgramChange from "./modules/drum-program";
import MixerNodes from "./modules/node";
import { DRUM_CHANNEL } from "@/config/value";
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
    drumNode.program?.linkEvent(
      ["PROGARM", "CHANGE"],
      (value) => setProgarm(value.value),
      componentId
    );

    return () => {
      drumNode.program?.unlinkEvent?.(["PROGARM", "CHANGE"], componentId);
    };
  }, [nodes]);

  return (
    <>
      <WinboxModal
        onClose={() => setOpen(false)}
        title="Mixer"
        height={320}
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
        size="xs"
        blur={{ border: true }}
        onClick={openMixer}
        icon={<RxMixerVertical></RxMixerVertical>}
      >
        เครื่องดนตรี
      </Button>
    </>
  );
};

export default FullMixer;
