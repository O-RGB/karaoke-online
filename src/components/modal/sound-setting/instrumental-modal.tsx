import RangeBar from "@/components/common/input-data/range-bar";
import SliderCommon from "@/components/common/input-data/slider";
import { INSTRUMENT_TYPE_BY_INDEX } from "@/features/engine/modules/instrumentals-node/modules/instrumental";
import { InstrumentType } from "@/features/engine/modules/instrumentals-node/types/inst.category.type";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import React, { useEffect, useState } from "react";

interface InstrumentalModalProps {}

const InstrumentalModal: React.FC<InstrumentalModalProps> = ({}) => {
  const [expression, setExpression] = useState<number>(100);
  const [velocity, setVelocity] = useState<number>(100);
  const [selectType, setSelectType] = useState<InstrumentType>();

  const inst = useSynthesizerEngine((state) => state.engine?.instrumentalNodes);

  const onClickType = (type: InstrumentType) => {
    const ex = inst?.getExperssion(type);
    const ve = inst?.getVelocity(type);
    if (ex) setExpression(ex);
    if (ve) setVelocity(ve);
    setSelectType(type);
  };

  const onExperssionChange = (value: number) => {
    if (!selectType) return;
    inst?.setExpression(selectType, value);
  };
  const onVelocityChange = (value: number) => {
    if (!selectType) return;
    inst?.setVelocity(selectType, value);
  };

  useEffect(() => {
    if (!selectType) return;
    const nodes = inst?.getNodesByType(selectType) ?? [];
    if (nodes.length > 0) {
      const node = nodes[0];
      if (!node.channel) return;
      node.setCallBackState<number>(
        ["EXPRESSION", "CHANGE"],
        node.channel,
        (v) => setExpression(v.value)
      );
      node.setCallBackState<number>(["VELOCITY", "CHANGE"], node.channel, (v) =>
        setVelocity(v.value)
      );
    }
  }, [selectType]);

  return (
    <div className="grid grid-cols-8">
      <div className="col-span-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {INSTRUMENT_TYPE_BY_INDEX.map((value, index) => {
          const text = value
            .split("_")
            .map((x) =>
              x.length > 0
                ? `${x.charAt(0).toUpperCase()}${x.substring(1, x.length)}`
                : ""
            )
            .join(" ");
          return (
            <div
              onClick={() => {
                onClickType(value);
              }}
              className={`${
                selectType === value ? "bg-blue-500 text-white" : ""
              } h-32 border rounded text-center hover:bg-gray-100 duration-300 cursor-pointer`}
            >
              <div className="pt-2">
                <span className="text-sm">
                  <span>{`${index + 1}`}.</span> {text}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="col-span-2 px-4 flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-500">
            Expression ({expression})
          </span>
          <SliderCommon
            onChange={onExperssionChange}
            value={expression}
            max={127}
          ></SliderCommon>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-500">Velocity ({velocity})</span>
          <SliderCommon
            onChange={onVelocityChange}
            value={velocity}
            max={127}
          ></SliderCommon>
        </div>
        <div>{JSON.stringify(selectType)}</div>
      </div>
    </div>
  );
};

export default InstrumentalModal;
