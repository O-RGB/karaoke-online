import { InstrumentalNode } from "@/features/engine/modules/instrumentals-node/modules/instrumental";
import { InstrumentType } from "@/features/engine/modules/instrumentals-node/types/inst.category.type";
import React, { useEffect, useState } from "react";

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
  const text = type
    .split("_")
    .map((x) =>
      x.length > 0 ? `${x.charAt(0).toUpperCase()}${x.substring(1)}` : ""
    )
    .join(" ");

  const [expression, setExpression] = useState<number>(0);
  const [velocity, setVelocity] = useState<number>(0);

  useEffect(() => {
    if (!instrumental) return;

    instrumental.setCallBackState(["EXPRESSION", "CHANGE"], index, (v) => {
      setExpression(v.value);
    });
    instrumental.setCallBackState(["VELOCITY", "CHANGE"], index, (v) => {
      setVelocity(v.value);
    });

    return () => {
      instrumental.removeCallback(["EXPRESSION", "CHANGE"], index, (v) => {
        setExpression(v.value);
      });
      instrumental.removeCallback(["VELOCITY", "CHANGE"], index, (v) => {
        setVelocity(v.value);
      });
    };
  }, [instrumental]);

  const expressionPercent = (expression / 127) * 100;
  const velocityPercent = (velocity / 127) * 100;

  return (
    <div
      onClick={() => onClick?.(type, index)}
      className={`${
        selected === type ? "border-blue-500 border-2" : "bg-white"
      } flex items-center h-8 w-full border hover:bg-gray-100 duration-300 cursor-pointer p-2 relative`}
    >
      <div className="relative z-10">
        <span className="text-sm font-medium">
          <span>{`${index + 1}`}.</span> {text}
        </span>
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
