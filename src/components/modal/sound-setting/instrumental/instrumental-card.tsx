import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import { InstrumentalNode } from "@/features/engine/modules/instrumentals/instrumental";
import { InstrumentType } from "@/features/engine/modules/instrumentals/types/node.type";

import React, { useEffect, useId, useState } from "react";

interface InstrumentalCardProps {
  instrumental?: InstrumentalNode;
  index: number;
  type: InstrumentType;
  selected?: InstrumentType;
  onClick?: (type: InstrumentType, index: number) => void;
}

const InstrumentalCard: React.FC<InstrumentalCardProps> = ({
  instrumental,
  index,
  selected,
  type,
  onClick,
}) => {
  const componentId = useId();
  const text = type
    .split("_")
    .map((x) =>
      x.length > 0 ? `${x.charAt(0).toUpperCase()}${x.substring(1)}` : ""
    )
    .join(" ");

  const [expression, setExpression] = useState<number>(0);
  const [velocity, setVelocity] = useState<number>(0);
  const [channelRef, setChannelRef] = useState<Map<number, SynthChannel>>(
    new Map()
  );

  useEffect(() => {
    if (!instrumental) return;

    instrumental.setCallBackState(
      ["EXPRESSION", "CHANGE"],
      index,
      (v) => {
        setExpression(v.value);
      },
      componentId
    );
    instrumental.setCallBackState(
      ["VELOCITY", "CHANGE"],
      index,
      (v) => {
        setVelocity(v.value);
      },
      componentId
    );
    instrumental.setCallBackGroup(
      [type, "CHANGE"],
      index,
      (v) => {
        console.log("ON GROUP CHANGE = ", v);
        setChannelRef(v.value);
      },
      componentId
    );

    return () => {
      instrumental.removeCallback(["EXPRESSION", "CHANGE"], index, componentId);
      instrumental.removeCallback(["VELOCITY", "CHANGE"], index, componentId);
    };
  }, [instrumental]);

  const expressionPercent = (expression / 127) * 100;
  const velocityPercent = (velocity / 127) * 100;

  return (
    <div
      onClick={() => onClick?.(type, index)}
      className={`${
        selected === type ? "border-blue-500 border-2" : "bg-white"
      } flex items-center min-h-8 w-full border  cursor-pointer p-2 relative`}
    >
      <div className="relative z-10 flex flex-wrap gap-1">
        <span className="text-sm font-medium">
          <span>{`${index + 1}`}.</span> {text}
        </span>
        <div className="flex flex-wrap gap-1 text-xs">
          {Array.from(channelRef.entries()).map(
            ([i, value]) =>
              value.channel !== undefined && (
                <div
                  key={`ch-ref-${i}`}
                  className="border px-1 rounded bg-white w-fit"
                >
                  ch:{value.channel + 1}{" "}
                </div>
              )
          )}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-full">
        <div
          className="bg-green-500/10 h-full border-r-2 border-green-500/50"
          style={{ width: `${expressionPercent - 0.5}%` }}
        ></div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-full">
        <div
          className="bg-amber-500/10 h-full border-r-2 border-amber-500/50"
          style={{ width: `${velocityPercent + 0.5}%` }}
        ></div>
      </div>
    </div>
  );
};

export default InstrumentalCard;
