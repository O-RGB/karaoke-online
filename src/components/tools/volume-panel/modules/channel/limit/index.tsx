import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import {
  findProgramCategory,
  InstrumentalNode,
} from "@/features/engine/modules/instrumentals/instrumental";
import { TEventType } from "@/features/engine/modules/instrumentals/types/node.type";
import React, { useEffect, useId, useState } from "react";
import LimitBarRender from "./bar-render";
import EqTag from "../eq-tag";

interface ChannelLimitProps {
  instrumental?: InstrumentalNode;
  node: SynthChannel;
  channel: number;
}

const ChannelLimit: React.FC<ChannelLimitProps> = ({
  instrumental,
  channel,
  node,
}) => {
  const componentId = useId();
  const [category, setCategory] = useState<number>(0);
  const [program, setProgram] = useState<number>(0);

  const onProgramChange = (value: TEventType<number>) => {
    const category = findProgramCategory(value.value);
    setProgram(value.value);
    if (category?.index) setCategory(category?.index);
  };

  useEffect(() => {
    node.program?.linkEvent(
      ["PROGARM", "CHANGE"],onProgramChange,componentId
    );

    return () => {
      node.program?.unlinkEvent(["PROGARM", "CHANGE"], componentId);
    };
  }, [node]);

  if (!node || program === undefined) return;

  return (
    <>
      <div className="absolute top-0">
        <EqTag
          category={category}
          channel={channel}
          instrumental={instrumental}
        ></EqTag>
      </div>
      <div className="absolute w-full h-[73%] bottom-5">
        <LimitBarRender
          program={program}
          category={category}
          instrumental={instrumental}
        ></LimitBarRender>
      </div>
    </>
  );
};

export default ChannelLimit;
