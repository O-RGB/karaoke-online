import RangeBarClone from "@/components/common/input-data/range-bar-clone";
import useVolumeStore from "@/stores/volume-store";
import React from "react";

interface VolumeAnimtaionProps {
  onMouseUp?: () => void;
  onTouchEnd?: () => void;
  onChange?: (value: number) => void;
  hideVolume: boolean;
  channel: number;
}

const VolumeAnimtaion: React.FC<VolumeAnimtaionProps> = ({
  channel,
  hideVolume,
  onChange,
  onMouseUp,
  onTouchEnd,
}) => {
  const volume = useVolumeStore((state) => state.volume);

  return (
    <RangeBarClone
      value={hideVolume ? 0 : volume[channel]}
      className="z-20"
      disabled={hideVolume}
      max={127}
      onMouseUp={onMouseUp}
      onTouchEnd={onTouchEnd}
      onChange={onChange}
    ></RangeBarClone>
  );
};

export default VolumeAnimtaion;
