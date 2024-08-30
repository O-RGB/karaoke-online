import React, { useEffect } from "react";
import VolumeMeter from "../common/volume/volume-meter";
import { Synthetizer } from "spessasynth_lib";
import { volumeChange } from "@/lib/mixer";
import { useMixer } from "@/hooks/mixer-hooks";
import { useRemote } from "@/hooks/peer-hooks";

interface VolumePanelProps {
  gainNode: number[];
  synth?: Synthetizer;
  onVolumeChange?: (channel: number, value: number) => void;
}

const VolumePanel: React.FC<VolumePanelProps> = ({
  gainNode,
  synth,
  onVolumeChange,
}) => {
  const { updateVolume, volumeController } = useMixer();

  const onVolumeMeterChange = (channel: number, value: number) => {
    if (synth) {
      volumeChange(channel, value, synth);
      updateVolume(channel, value);
    } else {
      onVolumeChange?.(channel, value);
    }
  };

  return (
    <>
      <div className="flex flex-wrap lg:flex-row divide-x divide-slate-600">
        {gainNode.map((data, index) => {
          return (
            <div className="relative" key={`gin-${index}`}>
              <VolumeMeter
                value={volumeController[index]}
                level={data}
                channel={index + 1}
                onChange={onVolumeMeterChange}
              ></VolumeMeter>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default VolumePanel;
