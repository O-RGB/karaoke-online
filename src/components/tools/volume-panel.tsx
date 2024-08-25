import React from "react";
import VolumeMeter from "../common/volume/volume-meter";
import { Synthetizer } from "spessasynth_lib";
import { volumeChange } from "@/lib/mixer";

interface VolumePanelProps {
  gainNode: number[];
  synth: Synthetizer;
  //   onChangeVolume?: (channel: number, value: number) => void;
}

const VolumePanel: React.FC<VolumePanelProps> = ({
  gainNode,
  synth,
  //   onChangeVolume,
}) => {
  const onVolumeMeterChange = (channel: number, value: number) => {
    volumeChange(channel, value, synth);
  };

  return (
    <>
      <div className="flex divide-x border">
        {gainNode.map((data, index) => {
          return (
            <div className="relative" key={`gin-${index}`}>
              <VolumeMeter
                level={data}
                channel={index + 1}
                onChange={onVolumeMeterChange}
              ></VolumeMeter>
              {data}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default VolumePanel;
