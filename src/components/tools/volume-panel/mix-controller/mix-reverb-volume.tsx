import RangeBarClone from "@/components/common/input-data/range-bar-clone";
import SliderCommon from "@/components/common/input-data/slider";
import useMixerStoreNew from "@/stores/player/event-player/modules/event-mixer-store";
import React from "react";

interface MixReverbVolumeProps {
  disabled?: boolean;
  channel: number;
  onReverbChange: (value: number) => void;
}

const MixReverbVolume: React.FC<MixReverbVolumeProps> = ({
  disabled,
  channel,
  onReverbChange,
}) => {
  const reverb = useMixerStoreNew((state) => state.reverb[channel]);
  return (
    <>
      <SliderCommon
        disabled={disabled}
        value={disabled ? 0 : reverb}
        onChange={onReverbChange}
        className="z-20"
        max={127}
        vertical={false}
      ></SliderCommon>
    </>
  );
};

export default MixReverbVolume;
