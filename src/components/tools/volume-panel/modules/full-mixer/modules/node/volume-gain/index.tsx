import { useSynthesizerEngine } from "@/features/engine/synth-store";
import React, { useEffect, useId, useState } from "react";
import SliderCommon from "@/components/common/input-data/slider";

interface VolumeGainNodeProps {}

const VolumeGainNode: React.FC<VolumeGainNodeProps> = ({}) => {
  const componentId = useId();
  const engin = useSynthesizerEngine((state) => state.engine);
  const [master, setMaster] = useState<number>(30);

  const onValueChange = (value: number) => {
    engin?.setGain?.(value);
  };

  useEffect(() => {
    engin?.gain?.on(["GAIN", "CHANGE"], (v) => setMaster(v.value), componentId);

    return () => {
      engin?.gain?.off(["GAIN", "CHANGE"], componentId);
    };
  }, [engin?.gain]);

  if (!engin?.gain) return <>er</>;
  return (
    <>
      <div className="relative flex flex-col min-w-11 w-min-w-11 max-w-min-w-11 overflow-hidden border-b pb-2">
        <div className="h-full">
          <div className="h-full bg-gray-800 text-gray-400cursor-pointer py-1 text-[9px] text-center break-all text-nowrap font-medium text-gray-400">
            Gain
          </div>
        </div>
        <div className="relative bg-black py-2">
          <div className="relative h-32 flex py-2 z-10">
            <SliderCommon
              max={100}
              value={master}
              min={0}
              vertical
              className="m-auto h-full"
              color="#ffffff"
              step={1}
              onChange={onValueChange}
            ></SliderCommon>
          </div>
        </div>
      </div>
    </>
  );
};

export default VolumeGainNode;
