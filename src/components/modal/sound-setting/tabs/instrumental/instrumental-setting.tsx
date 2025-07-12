import SliderCommon from "@/components/common/input-data/slider";
import { InstrumentalNode } from "@/features/engine/modules/instrumentals/instrumental";
import { enumToReadable, lowercaseToReadable } from "@/lib/general";
import React, { useEffect, useId, useState } from "react";
import {
  INodeState,
  InstrumentType,
} from "@/features/engine/modules/instrumentals/types/node.type";
import { SynthNode } from "@/features/engine/modules/instrumentals/node";

interface InstrumentalSettingProps {
  instrumental?: InstrumentalNode;
  selectedType?: InstrumentType;
  selectedIndex: number;
  valueKey: INodeState;
  color: string;
}

const InstrumentalSetting: React.FC<InstrumentalSettingProps> = ({
  instrumental,
  selectedType,
  selectedIndex,
  valueKey,
  color,
}) => {
  const componentId = useId();

  const [value, setValue] = useState<number>(
    valueKey === "EXPRESSION" ? 100 : 0
  );

  const onValueChange = (value: number) => {
    if (selectedType === undefined) return;
    if (valueKey === "EXPRESSION") {
      instrumental?.setExpression(selectedType, value, selectedIndex);
    } else {
      instrumental?.setVelocity(selectedType, value, selectedIndex);
    }
  };

  useEffect(() => {
    if (!instrumental) return;

    let synthNode: SynthNode<INodeState, number> | undefined = undefined
    if (valueKey === "EXPRESSION") {
      synthNode = instrumental.expression[selectedIndex]
    } else {
      synthNode = instrumental.velocity[selectedIndex]
    }

    synthNode.linkEvent(
      [valueKey, "CHANGE"],
      (v) => {
        setValue(v.value);
      },
      componentId
    );

    return () => {
      synthNode.unlinkEvent(
        [valueKey, "CHANGE"],
        componentId
      );
    };
  }, [instrumental, selectedIndex, selectedType]);

  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="text-lg font-bold">
          {selectedType && lowercaseToReadable(selectedType)}
        </span>
        <span className="text-sm">
          <span>{enumToReadable(valueKey)} </span>
          <span style={{ color }}>{value}</span>
        </span>
        <SliderCommon
          color={color}
          onChange={onValueChange}
          value={value}
          max={127}
        ></SliderCommon>
      </div>
    </>
  );
};

export default InstrumentalSetting;
