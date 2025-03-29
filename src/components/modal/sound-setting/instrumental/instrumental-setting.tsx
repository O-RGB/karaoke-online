import SliderCommon from "@/components/common/input-data/slider";
import { InstrumentalNode } from "@/features/engine/modules/instrumentals-node/modules/instrumental";
import { InstrumentalNodeUpdate } from "@/features/engine/modules/instrumentals-node/modules/instrumental/update";
import { InstrumentType } from "@/features/engine/modules/instrumentals-node/types/inst.category.type";
import React, { useEffect, useState } from "react";

interface InstrumentalSettingProps {
  inst?: InstrumentalNodeUpdate;
  selectedType?: InstrumentType;
  selectedIndex?: number;
  valueKey: "velocity" | "expression";
}

const InstrumentalSetting: React.FC<InstrumentalSettingProps> = ({
  inst,
  selectedType,
  selectedIndex,
  valueKey,
}) => {
  const [value, setValue] = useState<number>(100);

  const onValueChange = (value: number) => {
    if (!selectedType || !selectedIndex) return;
    if (valueKey === "expression") {
      inst?.setExpression(selectedType, value, selectedIndex);
    } else {
      // inst?.setVelocity(selectedType, value, selectedIndex);
    }
  };

  useEffect(() => {
    setValue(100);
    if (!selectedIndex || !inst) return;
    inst.setCallBackState(
      [valueKey.toUpperCase() as any, "CHANGE"],
      selectedIndex,
      (v) => {
        setValue(v.value);
      }
    );
    // if (valueKey === "expression") {
    //   const ex = inst.getExperssion(selectedIndex);
    //   if (ex) setValue(ex);
    // } else {
    //   const ve = inst.getVelocity(selectedIndex);
    //   if (ve) setValue(ve);
    // }
  }, [inst, selectedIndex, selectedType]);

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
