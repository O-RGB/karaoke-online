import SliderCommon from "@/components/common/input-data/slider";
import { InstrumentalNode } from "@/features/engine/modules/instrumentals-node/modules/instrumental/update";
import { INodeState } from "@/features/engine/modules/instrumentals-node/modules/types/node.type";
import { InstrumentType } from "@/features/engine/modules/instrumentals-node/types/inst.category.type";
import React, { useEffect, useState } from "react";

interface InstrumentalSettingProps {
  instrumental?: InstrumentalNode;
  selectedType?: InstrumentType;
  selectedIndex?: number;
  valueKey: INodeState;
}

const InstrumentalSetting: React.FC<InstrumentalSettingProps> = ({
  instrumental,
  selectedType,
  selectedIndex,
  valueKey,
}) => {
  const [value, setValue] = useState<number>(100);

  const onValueChange = (value: number) => {
    if (!selectedType || !selectedIndex) return;
    if (valueKey === "EXPRESSION") {
      instrumental?.setExpression(selectedType, value, selectedIndex);
    } else {
      instrumental?.setVelocity(selectedType, value, selectedIndex);
    }
  };

  useEffect(() => {
    if (!selectedIndex || !instrumental) return;

    instrumental.setCallBackState([valueKey, "CHANGE"], selectedIndex, (v) => {
      setValue(v.value);
    });

    return () => {
      instrumental.removeCallback([valueKey, "CHANGE"], selectedIndex, (v) => {
        setValue(v.value);
      });
    };
  }, [instrumental, selectedIndex, selectedType]);

  if (!selectedIndex) return <></>;

  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="text-lg font-bold">
          {selectedType &&
            selectedType
              .split("_")
              .map((x) =>
                x.length > 0
                  ? `${x.charAt(0).toUpperCase()}${x.substring(1, x.length)}`
                  : ""
              )
              .join(" ")}
        </span>
        <span className="text-sm text-gray-500">
          {valueKey.charAt(0).toUpperCase() +
            valueKey.substring(1, valueKey.length)}{" "}
          ({value})
        </span>
        <SliderCommon
          onChange={onValueChange}
          value={value}
          max={127}
        ></SliderCommon>
      </div>
    </>
  );
};

export default InstrumentalSetting;
