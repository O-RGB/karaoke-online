import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import RangeBarClone from "@/components/common/input-data/range-bar-clone";
import SliderCommon from "@/components/common/input-data/slider";
import { useSynthesizerEngine } from "@/stores/engine/synth-store";
import {
  IControllerChange,
  ILockController,
} from "@/stores/engine/types/synth.type";
import useMixerStoreNew from "@/stores/player/event-player/modules/event-mixer-store";
import {
  INodeCallBack,
  NodeType,
} from "@/stores/player/event-player/types/node.type";
import React, { useEffect, useState } from "react";
import { FaLock, FaUnlock } from "react-icons/fa";

interface MixNodeControllerProps {
  disabled?: boolean;
  channel: number;
  nodeType: NodeType;
  vertical?: boolean;
  label?: string;
  onChange?: (value: IControllerChange) => void;
  onLock?: (value: ILockController) => void;
  controllerNumber: number;
}

const MixNodeController: React.FC<MixNodeControllerProps> = ({
  disabled,
  channel,
  nodeType,
  vertical = false,
  label,
  onChange,
  onLock,
  controllerNumber,
}) => {
  const controllerItem = useSynthesizerEngine(
    (state) => state.engine?.controllerItem
  );
  const [volume, setValue] = useState<number>(100);
  const [locked, setLocked] = useState<boolean>(false);

  const onValueChange = (event: INodeCallBack) => {
    setValue(event.value);
  };
  const onLockChange = (event: INodeCallBack) => {
    setLocked(event.value);
  };

  useEffect(() => {
    if (controllerItem) {
      controllerItem.addEventCallBack(
        nodeType,
        "CHANGE",
        channel,
        onValueChange
      );
      controllerItem.addEventCallBack(nodeType, "LOCK", channel, onLockChange);
    }
  }, [controllerItem, nodeType]);

  function LabelTag({ name }: { name: string }) {
    return (
      <div className="min-w-16 rounded-md pr-2 flex items-center text-nowrap">
        <Label className="flex justify-between w-full">
          <span className="text-gray-600">{name}</span> <span>:</span>
        </Label>
      </div>
    );
  }

  const SliderProps = (
    <SliderCommon
      color={locked ? "red" : undefined}
      vertical={vertical}
      disabled={disabled}
      value={disabled ? 0 : volume}
      onChange={(value) =>
        onChange?.({ channel, controllerNumber, controllerValue: value })
      }
      className="z-20"
      max={127}
      onPressStart={() => {
        controllerItem?.setUserHolding(true);
      }}
      onPressEnd={() => {
        controllerItem?.setUserHolding(false);
      }}
    ></SliderCommon>
  );

  if (!label) {
    return SliderProps;
  }

  return (
    <>
      <div className="flex gap-1 justify-center items-center">
        {label && (
          <>
            <LabelTag name={label}></LabelTag>
            <div className="pr-0.5">
              <Button
                onClick={() =>
                  onLock?.({ channel, controllerNumber, isLocked: !locked })
                }
                icon={
                  locked ? (
                    <FaLock className="text-[8px] text-red-500"></FaLock>
                  ) : (
                    <FaUnlock className="text-[8px] text-gray-500"></FaUnlock>
                  )
                }
                className="!p-1.5 shadow-none border-none"
              ></Button>
            </div>
          </>
        )}
        {SliderProps}
      </div>
    </>
  );
};

export default MixNodeController;
