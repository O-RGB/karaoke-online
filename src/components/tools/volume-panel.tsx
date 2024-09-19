import React, { useEffect } from "react";
import VolumeMeter from "../common/volume/volume-meter";
import { Synthetizer } from "spessasynth_lib";
import { volumeChange } from "@/lib/app-control";
import { useAppControl } from "@/hooks/app-control-hook";

interface VolumePanelProps {
  audioGain: number[];
  instrument: number[];
  synth?: Synthetizer;
  onVolumeChange?: (channel: number, value: number) => void;
}

const VolumePanel: React.FC<VolumePanelProps> = ({
  audioGain,
  instrument,
  synth,
  onVolumeChange,
}) => {
  const { updateVolume, volumeController } = useAppControl();

  const onVolumeMeterChange = (channel: number, value: number) => {
    if (synth) {
      volumeChange(channel, value, synth);
      updateVolume(channel, value);
    } else {
      onVolumeChange?.(channel, value);
    }
  };

  useEffect(() => {}, [audioGain]);

  return (
    <div className="fixed w-full top-16 lg:top-[4.2rem] left-0 px-5">
      <div className="grid grid-cols-8 flex-none lg:flex lg:flex-row w-full lg:w-fit gap-1 blur-overlay border blur-border rounded-md p-2">
        {audioGain.map((data, ch) => {
          return (
            <div
              className="flex w-full items-center justify-center"
              key={`gin-${ch}`}
            >
              <VolumeMeter
                instruments={instrument[ch]}
                value={volumeController[ch]}
                level={data}
                channel={ch + 1}
                onChange={onVolumeMeterChange}
              ></VolumeMeter>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VolumePanel;
