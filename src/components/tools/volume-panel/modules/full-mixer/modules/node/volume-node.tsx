import React, { useEffect, useId, useState } from "react";
import ChannelVolumeRender from "../../../../renders/volume-meter";
import SliderCommon from "@/components/common/input-data/slider";
import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import { lowercaseToReadable } from "@/lib/general";
import { Instrumental } from "@/features/engine/modules/instrumentals-group/inst";
import { InstsKeysMap } from "@/features/engine/modules/instrumentals-group/types";

interface InstrumentalVolumeNodeProps {
  indexKey: number;
  type: InstsKeysMap;
  instrumental: Instrumental;
}

const InstrumentalVolumeNode: React.FC<InstrumentalVolumeNodeProps> = ({
  indexKey,
  type,
  instrumental,
}) => {
  const componentId = useId();
  const [groupCh, setGroupCh] = useState<SynthChannel[]>([]);
  const [expression, setGain] = useState<number>(instrumental.defaultGain);
  const text = lowercaseToReadable(type);

  const onValueChange = (value: number) => {
    instrumental.setGain(value);
    setGain(value);
  };

  useEffect(() => {
    instrumental.inst?.on([type, "CHANGE"], (v) => {}, componentId);
    return () => {};
  }, [indexKey, instrumental]);
  return (
    <>
      <div className="relative flex flex-col gap-2 min-w-12 w-12 max-w-12 overflow-hidden border-b pb-2">
        <div className="px-0.5">
          <div className="text-[10px] text-center break-all text-nowrap">
            {text}
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
              max={127}
              value={expression}
              vertical
              className="m-auto"
              color="#ffffff"
              step={5}
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

export default InstrumentalVolumeNode;
