import React, { useEffect } from "react";
import VolumeMeter from "../common/volume/volume-meter";
import { Synthetizer } from "spessasynth_lib";
import { volumeChange } from "@/lib/mixer";
import { useMixer } from "@/app/hooks/mixer-hooks";

interface VolumePanelProps {
  gainNode: number[];
  synth: Synthetizer;
  control?: string;
  //   onChangeVolume?: (channel: number, value: number) => void;
}

const VolumePanel: React.FC<VolumePanelProps> = ({
  gainNode,
  synth,
  control,
  //   onChangeVolume,
}) => {
  const { updateVolume, volumeController } = useMixer();

  const onVolumeMeterChange = (channel: number, value: number) => {
    volumeChange(channel, value, synth);
    updateVolume(channel, value);
  };

  useEffect(() => {
    onVolumeMeterChange(9, Number(control));
    console.log(control);
  }, [control]);

  return (
    <>
      <div className="flex divide-x border">
        {gainNode.map((data, index) => {
          return (
            <div className="relative" key={`gin-${index}`}>
              <VolumeMeter
                value={volumeController[index]}
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
