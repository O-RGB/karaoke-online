import { useSynthesizerEngine } from "@/features/engine/synth-store";
import React, { useState } from "react";
import InstrumentalCard from "./instrumental-card";
import InstrumentalSetting from "./instrumental-setting";
import { INSTRUMENT_TYPE_BY_INDEX } from "@/features/engine/modules/instrumentals/instrumental";
import { InstrumentType } from "@/features/engine/modules/instrumentals/types/node.type";

interface InstrumentalModalProps {}

const InstrumentalModal: React.FC<InstrumentalModalProps> = ({}) => {
  const [selectType, setSelectType] = useState<InstrumentType>();
  const [selectIndex, setSelectIndex] = useState<number>();

  const instrumental = useSynthesizerEngine(
    (state) => state.engine?.instrumental
  );

  const onClickType = (type: InstrumentType, indexKey: number) => {
    setSelectType(type);
    setSelectIndex(indexKey);
  };

  return (
    <div className="relative grid grid-cols-8 h-full w-full overflow-auto">
      <div className="col-span-6 flex flex-col gap-0.5">
        {INSTRUMENT_TYPE_BY_INDEX.map((value, index) => {
          return (
            <React.Fragment key={`card-inst-${index}`}>
              <InstrumentalCard
                instrumental={instrumental}
                index={index}
                type={value}
                selected={selectType}
                onClick={onClickType}
              ></InstrumentalCard>
            </React.Fragment>
          );
        })}
      </div>
      <div className="relative top-0 col-span-2 px-4">
        <div className="sticky top-0 flex flex-col gap-2">
          {selectType && (
            <>
              <InstrumentalSetting
                color={"#00c951"}
                instrumental={instrumental}
                selectedIndex={selectIndex}
                selectedType={selectType}
                valueKey="EXPRESSION"
              ></InstrumentalSetting>
              <InstrumentalSetting
                color={"#fd9a00"}
                instrumental={instrumental}
                selectedIndex={selectIndex}
                selectedType={selectType}
                valueKey="VELOCITY"
              ></InstrumentalSetting>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstrumentalModal;
