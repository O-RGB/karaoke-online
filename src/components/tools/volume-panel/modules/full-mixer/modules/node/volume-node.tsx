import React, { useEffect, useId, useState } from "react";
import ChannelVolumeRender from "../../../../renders/volume-meter";
import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import { lowercaseToReadable } from "@/lib/general";
import { InstrumentType } from "@/features/engine/modules/instrumentals/types/node.type";
import SliderCommon from "@/components/common/input-data/slider";
import { InstrumentalNode } from "@/features/engine/modules/instrumentals/instrumental";
import WinboxModal from "@/components/common/modal";
import EQNode from "@/components/ui/eqnode";
import Button from "@/components/common/button/button";

interface InstrumentalVolumeNodeProps {
  node: SynthChannel[];
  indexKey: number;
  type: InstrumentType;
  instrumental: InstrumentalNode;
}

const InstrumentalVolumeNode: React.FC<InstrumentalVolumeNodeProps> = ({
  node,
  indexKey,
  type,
  instrumental,
}) => {
  const componentId = useId();
  const [expression, setExpression] = useState<number>(100);
  const text = lowercaseToReadable(type);

  const [eqOpen, setEqOpen] = useState<boolean>(false);

  const [open, setOpen] = useState<boolean>(false);
  const openEq = () => {
    setOpen(!open);
  };

  const onValueChange = (value: number) => {
    instrumental.setExpression(type, value, indexKey);
    setExpression(value);
  };

  useEffect(() => {
    instrumental.setCallBackState(
      ["EXPRESSION", "CHANGE"],
      indexKey,
      (v) => {
        setExpression(v.value);
      },
      componentId
    );
    return () => {
      instrumental.removeCallback(
        ["EXPRESSION", "CHANGE"],
        indexKey,
        componentId
      );
    };
  }, [indexKey, instrumental]);
  return (
    <>
      <WinboxModal
        onClose={() => setOpen(false)}
        title={text + " Equalizer"}
        width={400}
        isOpen={open}
      >
        <EQNode
          name={text}
          onEnabled={() => setEqOpen(true)}
          onDisabled={() => setEqOpen(false)}
          instrumental={instrumental}
          indexKey={indexKey}
          node={node}
        ></EQNode>
      </WinboxModal>
      <div className="relative flex flex-col gap-2 min-w-10 w-10 max-w-10">
        <Button
          onClick={openEq}
          padding={"p-1 px-2"}
          className={`${eqOpen ? "!bg-blue-500 !text-white" : ""}`}
        >
          EQ
        </Button>
        <div className="relative bg-black">
          <ChannelVolumeRender
            max={127}
            node={node}
            className="z-0 w-full absolute bottom-0 left-0 h-full"
          ></ChannelVolumeRender>
          <div className="relative h-32 flex py-4 z-50">
            <SliderCommon
              max={127}
              value={expression}
              vertical
              className="m-auto"
              step={5}
              onChange={onValueChange}
            ></SliderCommon>
          </div>
        </div>
        <span className="text-xs text-center break-all line-clamp-2 px-1">
          {text}
        </span>
      </div>
    </>
  );
};

export default InstrumentalVolumeNode;
