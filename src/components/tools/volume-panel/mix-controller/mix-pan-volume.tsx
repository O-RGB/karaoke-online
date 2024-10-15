import RangeBarClone from "@/components/common/input-data/range-bar-clone";
import useVolumeStore from "@/stores/volume-store";
import React from "react";

interface MixPanVolumeProps {
  disabled?: boolean;
  channel: number;
  onPenChange: (value: number) => void;
  onMouseUp?: () => void;
  onTouchEnd?: () => void;
}

const MixPanVolume: React.FC<MixPanVolumeProps> = ({
  disabled,
  channel,
  onPenChange,
  onMouseUp,
  onTouchEnd,
}) => {
  const pan = useVolumeStore((state) => state.pan[channel]);
  return (
    <>
      <RangeBarClone
        disabled={disabled}
        value={disabled ? 0 : pan}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        onChange={onPenChange}
        className="z-20"
        max={127}
        orientation="horizontal"
      ></RangeBarClone>
    </>
  );
};

export default MixPanVolume;
