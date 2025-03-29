import { InstrumentalNode } from "@/features/engine/modules/instrumentals-node/modules/instrumental";
import { InstrumentType } from "@/features/engine/modules/instrumentals-node/types/inst.category.type";
import React, { useEffect } from "react";

interface InstrumentalCardProps {
  index: number;
  type: InstrumentType;
  selected?: InstrumentType;

  onClick?: (type: InstrumentType, index: number) => void;
}

const InstrumentalCard: React.FC<InstrumentalCardProps> = ({
  index,
  selected,
  type,
  onClick,
}) => {
  const text = type
    .split("_")
    .map((x) =>
      x.length > 0
        ? `${x.charAt(0).toUpperCase()}${x.substring(1, x.length)}`
        : ""
    )
    .join(" ");
  return (
    <>
      <div
        onClick={() => {
          onClick?.(type, index);
        }}
        className={`${
          selected === type ? "bg-blue-500 text-white" : ""
        } h-32 border rounded text-center hover:bg-gray-100 duration-300 cursor-pointer`}
      >
        <div className="pt-2">
          <span className="text-sm">
            <span>{`${index + 1}`}.</span> {text}
          </span>
        </div>
      </div>
    </>
  );
};

export default InstrumentalCard;
