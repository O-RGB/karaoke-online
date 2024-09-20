import React, { useEffect, useState } from "react";
import VolumeMeter from "../common/volume/volume-meter";
import { Synthetizer } from "spessasynth_lib";
import { useAppControl } from "@/hooks/app-control-hook";
import {
  PiMicrophoneStageFill,
  PiTimerFill,
  PiUserMinusFill,
  PiUserSoundFill,
} from "react-icons/pi";
import NumberButton from "../common/input-data/number-button";
import SwitchButton from "../common/input-data/switch-button";

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
  const VOCAL_CHANNEL = 8;
  const {
    updateVolumeSysth,
    updateVolumeHeld,
    updatePitch,
    addNotification,
    volumeController,
  } = useAppControl();
  const [lock, setLock] = useState<boolean[]>(Array(16).fill(false));

  const onVolumeMeterChange = (channel: number, value: number) => {
    if (synth) {
      updateVolumeSysth(channel, value);
    } else {
      onVolumeChange?.(channel, value);
    }
  };

  const onLockVolume = (channel: number) => {
    const ch_index = channel - 1;
    let clone: boolean[] = { ...lock };
    let vByIndex = !clone[ch_index];
    clone[ch_index] = vByIndex;
    if (vByIndex) {
      onVolumeMeterChange(ch_index, 0);
    } else {
      onVolumeMeterChange(ch_index, 100);
    }
    setLock(clone);
  };

  const onLockVocal = (mute: boolean = false) => {
    const vocal = lock[VOCAL_CHANNEL];
    if (mute === vocal) {
      onLockVolume(VOCAL_CHANNEL + 1);
    }
  };

  useEffect(() => {}, [audioGain]);

  return (
    <div className="fixed w-full top-16 lg:top-[4.2rem] left-0 px-5 flex flex-col gap-2 ">
      <div className="grid grid-cols-8 flex-none lg:flex lg:flex-row w-full lg:w-fit gap-1 blur-overlay border blur-border rounded-md p-2">
        {audioGain.map((data, ch) => {
          return (
            <div
              className="flex w-full items-center justify-center"
              key={`gin-${ch}`}
            >
              <VolumeMeter
                onLock={onLockVolume}
                isLock={lock[ch]}
                instruments={instrument[ch]}
                value={volumeController[ch]}
                level={data}
                channel={ch + 1}
                onChange={onVolumeMeterChange}
                onMouseUp={() => updateVolumeHeld(true)}
                onTouchEnd={() => updateVolumeHeld(false)}
              ></VolumeMeter>
              <br />
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <NumberButton
          onChange={(value) => { 
            updatePitch(value);
            addNotification(`Pitch ${value}`);
          }}
          value={0}
          icon={
            <PiMicrophoneStageFill className="text-[15px]"></PiMicrophoneStageFill>
          }
        ></NumberButton>
        <NumberButton
          value={100}
          icon={<PiTimerFill className="text-[15px]"></PiTimerFill>}
        ></NumberButton>
        <SwitchButton
          onChange={onLockVocal}
          iconOpen={<PiUserSoundFill></PiUserSoundFill>}
          iconClose={<PiUserMinusFill></PiUserMinusFill>}
          labelOpen="Vocal"
          labelClose="Vocal"
        ></SwitchButton>
      </div>
    </div>
  );
};

export default VolumePanel;
