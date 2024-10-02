import React, { useCallback, useEffect, useRef, useState } from "react";
import VolumeMeter from "../common/volume/volume-meter";
import { Synthetizer } from "spessasynth_lib";
import { useAppControl } from "@/hooks/app-control-hook";
import {
  PiMicrophoneStageFill,
  PiUserMinusFill,
  PiUserSoundFill,
} from "react-icons/pi";
import NumberButton from "../common/input-data/number-button";
import SwitchButton from "../common/input-data/switch/switch-button";
import { useNotification } from "@/hooks/notification-hook";
import Button from "../common/button/button";
import { MdArrowDropUp } from "react-icons/md";
import { useSynth } from "@/hooks/spessasynth-hook";
import { useOrientation } from "@/hooks/orientation-hook";

interface VolumePanelProps {
  instrument: number[];
  onVolumeChange?: (channel: number, value: number) => void;
  analysers?: AnalyserNode[];
  audioGain?: number[];
  perset?: IPersetSoundfont[];
  options?: React.ReactNode;
}

const VolumePanel: React.FC<VolumePanelProps> = ({
  instrument,
  onVolumeChange,
  analysers,
  audioGain,
  perset,
  options,
}) => {
  const { orientation } = useOrientation();
  const { addNotification } = useNotification();
  const VOCAL_CHANNEL = 8;
  const {
    updateVolumeSysth,
    updateVolumeHeld,
    updatePitch,
    updatePerset,
    updateHideVolume,
    volumeController,
    hideVolume,
  } = useAppControl();
  const { synth, player } = useSynth();

  const [lock, setLock] = useState<boolean[]>(Array(16).fill(false));

  const gain = useRef<number[]>(Array(16).fill(0));
  const gainMain = useRef<number>(0);

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

  const onPersetChange = (channel: number, value: number) => {
    updatePerset(channel - 1, value);
  };

  const onHideVolume = (hide: boolean) => {
    updateHideVolume(hide);
  };
  const render = useCallback(() => {
    if (analysers) {
      console.log("vol run");
      const newVolumeLevels = analysers?.map((analyser) => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const value = Math.round(
          dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
        );
        return value;
      });

      if (hideVolume) {
        const totalGain = newVolumeLevels.reduce(
          (sum, value) => sum + value,
          0
        );
        const mainVolume = (totalGain / (newVolumeLevels.length * 100)) * 500;
        gainMain.current = mainVolume;
      } else {
        gain.current = newVolumeLevels;
      }
    }
  }, [analysers, hideVolume]); // เพิ่ม analysers และ hideVolume เป็น dependencies

  useEffect(() => {
    if (analysers && !player?.paused) {
      const intervalId = setInterval(() => render(), 100);
      return () => clearInterval(intervalId); // ล้าง interval เมื่อ component ถูก unmount
    }
  }, [analysers, render, player?.paused]); // เพิ่ม render เป็น dependencies

  useEffect(() => {
    if (!hideVolume) {
      gainMain.current = 0;
    }
  }, [hideVolume]);

  useEffect(() => {
    if (audioGain) {
      gain.current = audioGain;
    }
  }, [audioGain]);

  return (
    <div
      className={`fixed left-0 px-5 flex flex-col gap-1.5 overflow-hidden ${
        orientation === "landscape" ? " top-[18px] w-70" : " top-14 lg:top-6 w-full"
      }`}
    >
      <div
        className={`relative grid grid-cols-8 flex-none lg:flex lg:flex-row w-full lg:w-fit gap-y-2 lg:gap-y-0 gap-0.5 blur-overlay border blur-border rounded-md p-2 duration-300 overflow-hidden ${
          hideVolume
            ? "h-[30px] lg:h-[30px] pointer-events-none !cursor-none"
            : `${
                orientation === "landscape" ? "h-[230px]" : "h-[292px]"
              } lg:h-[150px]`
        }`}
      >
        <div
          className="absolute top-0 left-0 h-full bg-white/40 duration-100 transition-all"
          style={{
            width: `${gainMain.current}%`,
            opacity: !hideVolume ? 0 : 1,
          }}
        ></div>

        {gain.current.map((data, ch) => {
          return (
            <div
              style={{
                opacity: hideVolume ? 0 : 1,
              }}
              className=" flex w-full items-center justify-center duration-500"
              key={`gin-${ch}`}
            >
              <VolumeMeter
                height={`${orientation === "landscape" ? "4rem" : "6rem"}`}
                perset={perset}
                onLock={onLockVolume}
                isLock={lock[ch]}
                instruments={instrument[ch]}
                value={volumeController[ch]}
                level={data}
                channel={ch + 1}
                onPersetChange={onPersetChange}
                onChange={onVolumeMeterChange}
                onMouseUp={() => updateVolumeHeld(true)}
                onTouchEnd={() => updateVolumeHeld(false)}
              ></VolumeMeter>
              <br />
            </div>
          );
        })}
      </div>

      <div>
        <div className="flex gap-1.5">
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

          <SwitchButton
            onChange={onLockVocal}
            iconOpen={<PiUserSoundFill></PiUserSoundFill>}
            iconClose={<PiUserMinusFill></PiUserMinusFill>}
            labelOpen="Vocal"
            labelClose="Vocal"
          ></SwitchButton>
        </div>
        <div>{options}</div>
      </div>

      <div className="relative flex w-full lg:w-[592px] justify-center items-center h-0">
        <div className="absolute bottom-[38px] right-4">
          <Button
            tabIndex={-1}
            shadow={""}
            onClick={() => onHideVolume(!hideVolume)}
            onKeyDown={(event) =>
              event.key === "Enter" && event.preventDefault()
            }
            border="border blur-border focus:outline-none"
            padding=""
            className="px-3 h-3"
            icon={
              <MdArrowDropUp
                className={`${
                  hideVolume ? "rotate-180" : "rotate-0"
                } text-white duration-300`}
              ></MdArrowDropUp>
            }
          ></Button>
        </div>
      </div>
    </div>
  );
};

export default VolumePanel;
