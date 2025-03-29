import { INSTRUMENT_TYPE_BY_INDEX } from "@/features/engine/modules/instrumentals-node/modules/instrumental";
import { InstrumentType } from "@/features/engine/modules/instrumentals-node/types/inst.category.type";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import React, { useEffect, useState } from "react";
import InstrumentalCard from "./instrumental-card";
import InstrumentalSetting from "./instrumental-setting";

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

  useEffect(() => {}, [instrumental?.group]);

  return (
    <div className="grid grid-cols-8">
      <div className="col-span-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {INSTRUMENT_TYPE_BY_INDEX.map((value, index) => {
          return (
            <React.Fragment key={`card-inst-${index}`}>
              <InstrumentalCard
                index={index}
                type={value}
                selected={selectType}
                onClick={onClickType}
              ></InstrumentalCard>
            </React.Fragment>
          );
        })}
      </div>
      <div className="col-span-2 px-4 flex flex-col gap-2">
        {selectType && (
          <>
            <InstrumentalSetting
              instrumental={instrumental}
              selectedIndex={selectIndex}
              selectedType={selectType}
              valueKey="EXPRESSION"
            ></InstrumentalSetting>
            <InstrumentalSetting
              instrumental={instrumental}
              selectedIndex={selectIndex}
              selectedType={selectType}
              valueKey="VELOCITY"
            ></InstrumentalSetting>
          </>
        )}
      </div>
    </div>
  );
};

export default InstrumentalModal;
