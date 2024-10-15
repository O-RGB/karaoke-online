import RangeBarClone from "@/components/common/input-data/range-bar-clone";
import useVolumeStore from "@/stores/volume-store";
import React from "react";

interface MixReverbVolumeProps {
  disabled?: boolean;
  channel: number;
  onReverbChange: (value: number) => void;
  onMouseUp?: () => void;
  onTouchEnd?: () => void;
}

const MixReverbVolume: React.FC<MixReverbVolumeProps> = ({
  disabled,
  channel,
  onReverbChange,
  onMouseUp,
  onTouchEnd,
}) => {
  const reverb = useVolumeStore((state) => state.reverb[channel]);
  return (
    <>
      <RangeBarClone
        disabled={disabled}
        value={disabled ? 0 : reverb}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        onChange={onReverbChange}
        className="z-20"
        max={127}
        orientation="horizontal"
      ></RangeBarClone>
    </>
  );
};

export default MixReverbVolume;
