import SliderCommon from "@/components/common/input-data/slider";
import VolumeMeterIntervel from "@/components/common/volume/volume-meter-interver";
import { NodeController } from "@/features/engine/lib/node";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import React, { useEffect, useState } from "react";

interface MixerNodeProps {
  onSliderChange: (value: number) => void;
  title: string;
  iconSrc?: React.ReactNode;
  category: string;
  programs: number[];
}

const MixerNode: React.FC<MixerNodeProps> = ({
  onSliderChange,
  title,
  iconSrc,
  category,
  programs,
}) => {
  const [channelRef, setChannelRef] = useState<NodeController>();
  const controllerItem = useSynthesizerEngine(
    (state) => state.engine?.controllerItem
  );

  useEffect(() => {
    if (controllerItem) {
      const channel = controllerItem.searchProgram(programs);
      setChannelRef(channel);
    }
  }, [controllerItem]);

  return (
    <>
      <div className="border w-fit">
        <div className="flex items-center justify-center">
          <span className="text-[10px]">{category}</span>
          {iconSrc}
        </div>
        <div className="relative border p-2 px-3 flex justify-center bg-black">
          <div className="absolute left-0 top-0 w-32">
            {channelRef && (
              <VolumeMeterIntervel
                node={channelRef}
                max={127}
              ></VolumeMeterIntervel>
            )}
          </div>
          <div className="h-[150px]">
            <SliderCommon
              vertical={true}
              value={100}
              onChange={(value) => onSliderChange(value)}
              className="z-20"
              max={127}
              onPressStart={() => {
                controllerItem?.setUserHolding(true);
              }}
              onPressEnd={() => {
                controllerItem?.setUserHolding(false);
              }}
            ></SliderCommon>
          </div>
        </div>
      </div>
    </>
  );
};

export default MixerNode;
