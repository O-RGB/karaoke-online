import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import SliderCommon from "@/components/common/input-data/slider";
import { IControllerChange } from "@/features/engine/types/synth.type";
import React, { useEffect, useId, useState } from "react";
import { FaLock, FaUnlock } from "react-icons/fa";
import { INodeKey } from "@/features/engine/modules/instrumentals/types/node.type";
import { SynthNode } from "@/features/engine/modules/instrumentals/node";
interface VolumeNodePresetProps {
  disabled?: boolean;
  channel: number;
  nodeType: INodeKey;
  vertical?: boolean;
  label?: string;
  onChange?: (value: IControllerChange) => void;
  onLock?: (event: IControllerChange<boolean>) => void;
  controllerNumber: number;
  synthNode?: SynthNode<INodeKey, number>;
  className?: string;
}

const VolumeNodePreset: React.FC<VolumeNodePresetProps> = ({
  disabled,
  channel,
  nodeType,
  vertical = false,
  label,
  onChange,
  onLock,
  controllerNumber,
  synthNode,
  className,
}) => {
  const componentId = useId();
  const [volume, setValue] = useState<number>(100);
  const [locked, setLocked] = useState<boolean>(false);

  const onSliderChange = (value: number) => {
    const controllerEvent: IControllerChange = {
      channel,
      controllerNumber,
      controllerValue: value,
    };
    onChange?.(controllerEvent);
  };

  useEffect(() => {
    if (synthNode) {
      synthNode.linkEvent(
        [nodeType, "CHANGE"],
        (value) => setValue(value.value),
        componentId
      );
      synthNode?.linkEvent(
        [nodeType, "LOCK"],
        (value) => setLocked(value.value),
        componentId
      );
    }

    return () => {
      synthNode?.unlinkEvent([nodeType, "CHANGE"], componentId);
      synthNode?.unlinkEvent([nodeType, "LOCK"], componentId);
    };
  }, [synthNode]);

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
      onChange={onSliderChange}
      className={`z-20 ${className}`}
      max={127}
    ></SliderCommon>
  );

  if (!label) {
    return SliderProps;
  }

  if (!synthNode) return <></>;

  return (
    <>
      <div className="flex gap-1 justify-center items-center">
        {label && (
          <>
            <LabelTag name={label}></LabelTag>
            <div className="pr-0.5">
              <Button
                color="white"
                onClick={() =>
                  onLock?.({
                    channel,
                    controllerNumber,
                    controllerValue: !locked,
                  })
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

export default VolumeNodePreset;
