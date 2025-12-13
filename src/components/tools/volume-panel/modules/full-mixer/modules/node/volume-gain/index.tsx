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
      <div className="relative flex flex-col gap-2 min-w-11 w-11 max-w-11 overflow-hidden border-b pb-2">
        <div className="px-0.5">
          <div className="text-[9px] text-center break-all text-nowrap">
            Gain
          </div>
        </div>
        <div className="relative bg-black">
          {/* <ChannelVolumeRender
            max={127}
            node={groupCh}
            className="z-0 w-full absolute bottom-0 left-0 h-full"
          ></ChannelVolumeRender> */}
          <div className="relative h-32 flex py-4 z-50">
            <SliderCommon
              max={100}
              value={master}
              min={0}
              vertical
              className="m-auto"
              color="#ffffff"
              step={1}
              onChange={onValueChange}
            ></SliderCommon>
          </div>
        </div>
        {/* <div className="p-0.5 ">
          <img
            src={`/icon/instrument/${type}.png`}
            className="w-[50px] h-[30px] object-contain"
            alt=""
          />
        </div> */}
      </div>
    </>
  );
};

export default VolumeGainNode;
