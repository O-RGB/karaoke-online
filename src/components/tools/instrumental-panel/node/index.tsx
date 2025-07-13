import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import { InstrumentalNode } from "@/features/engine/modules/instrumentals/instrumental";
import { InstrumentType } from "@/features/engine/modules/instrumentals/types/node.type";
import React, { useEffect, useId, useState } from "react";
import ChannelVolumeRender from "../../volume-panel/renders/volume-meter";
import ChannelVolumeBg from "../../volume-panel/renders/velocity-render";

interface InstrumentalButtonRenderProps {
  type: InstrumentType;
  instrumental: InstrumentalNode;
  indexKey: number;
}

const InstrumentalButtonRender: React.FC<InstrumentalButtonRenderProps> = ({
  type,
  instrumental,
  indexKey,
}) => {
  const componentId = useId();
  const [groupCh, setGroupCh] = useState<SynthChannel[]>([]);
  const [expression, setExpression] = useState<number>(100);

  useEffect(() => {
    instrumental.expression[indexKey].linkEvent(
      ["EXPRESSION", "CHANGE"],
      (v) => setExpression(v.value),
      componentId
    );

    instrumental.linkEvent(
      [type, "CHANGE"],
      indexKey,
      (v: Map<number, SynthChannel>) => {
        setGroupCh(Array.from(v.values()));
      },
      componentId
    );
    return () => {
      instrumental.expression[indexKey].unlinkEvent(
        ["EXPRESSION", "CHANGE"],
        componentId
      );
      instrumental.equalizer[indexKey].unlinkEvent(
        ["EQUALIZER", "CHANGE"],
        componentId
      );
      instrumental.unlinkEvent([type, "CHANGE"], indexKey, componentId);
    };
  }, [indexKey, instrumental]);

  return (
    <div
      className="absolute bottom-0 left-0 z-20 w-full h-full"
      style={{
        opacity: `${expression}%`,
      }}
    >
      <ChannelVolumeBg
        node={groupCh}
        className={`w-full h-full rounded-md`}
      ></ChannelVolumeBg>
    </div>
  );
};

export default InstrumentalButtonRender;
