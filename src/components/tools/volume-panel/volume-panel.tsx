import React, { useCallback, useEffect, useRef, useState } from "react";
import VolumeMeter from "../../common/volume/volume-meter";
import { Synthetizer } from "spessasynth_lib";
import { useAppControl } from "@/hooks/app-control-hook";
import {
  PiMicrophoneStageFill,
  PiUserMinusFill,
  PiUserSoundFill,
} from "react-icons/pi";
import NumberButton from "../../common/input-data/number-button";
import SwitchButton from "../../common/input-data/switch/switch-button";
import { useNotification } from "@/hooks/notification-hook";
import Button from "../../common/button/button";
import { MdArrowDropUp } from "react-icons/md";
import { useSynth } from "@/hooks/spessasynth-hook";
import { useOrientation } from "@/hooks/orientation-hook";
import { useRemote } from "@/hooks/peer-hook";
import RangeBarClone from "../../common/input-data/range-bar-clone";
import VolumeMeterV from "../../common/volume/volume-meter-v";
import InstrumentsButton from "./instruments-button";
import VolumeAction from "./volume-action";
import VolumeHorizontal from "./volume-horizontal";

interface VolumePanelProps {
  instrument: number[];
  onVolumeChange?: (channel: number, value: number) => void;
  analysers?: AnalyserNode[];
  audioGain?: number[];
  perset?: IPersetSoundfont[];
  options?: React.ReactNode;
  className?: string;
}

const VolumePanel: React.FC<VolumePanelProps> = ({
  instrument,
  onVolumeChange,
  analysers,
  audioGain,
  perset,
  options,
  className,
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
  const { superUserConnections, sendSuperUserMessage } = useRemote();

  const [lock, setLock] = useState<boolean[]>(Array(16).fill(false));
  const volLayout: number[] = Array(16).fill(0);
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
    const fps = 20;
    const frameInterval = 1000 / fps; // 50ms ต่อ frame
    let lastFrameTime = 0;

    const renderFrame = (time: number) => {
      if (time - lastFrameTime >= frameInterval) {
        lastFrameTime = time;

        if (analysers) {
          const newVolumeLevels = analysers?.map((analyser) => {
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);
            const value = Math.round(
              dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
            );
            return value;
          });

          if (hideVolume) {
            const totalGain =
              newVolumeLevels?.reduce((acc, volume) => acc + volume, 0) || 0;
            const mainGain = (totalGain / (newVolumeLevels.length * 30)) * 100;

            gainMain.current = Math.round(mainGain); // กำหนดค่า mainGain
          } else {
            gain.current = newVolumeLevels;
          }

          if (superUserConnections.length > 0) {
            sendSuperUserMessage({
              message: newVolumeLevels,
              type: "GIND_NODE",
              user: "SUPER",
            });
          }
        }
      }

      if (!player?.paused) {
        requestAnimationFrame(renderFrame);
      }
    };

    if (!player?.paused) {
      requestAnimationFrame(renderFrame);
    }
  }, [analysers, hideVolume, superUserConnections, player?.paused]);

  useEffect(() => {
    if (analysers && !player?.paused) {
      requestAnimationFrame(render);
    }
  }, [analysers, render, player?.paused]);

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

  const grid =
    "grid grid-cols-8 lg:grid-cols-none grid-flow-row lg:grid-flow-col";
  const hideElement = `${hideVolume ? "opacity-0" : "opacity-100"}`;
  const animation = `duration-300 transition-all`;

  return (
    <div
      className={
        className
          ? className
          : `fixed left-0 px-5 flex flex-col gap-1.5 overflow-hidden  ${
              orientation === "landscape"
                ? " top-[18px] w-70"
                : " top-14 lg:top-6 w-full"
            }`
      }
    >
      <div
        className={`relative w-full lg:w-fit blur-overlay border blur-border rounded-md p-2 duration-300 overflow-hidden ${
          hideVolume
            ? "h-[30px] lg:h-[30px] pointer-events-none !cursor-none"
            : `${
                orientation === "landscape" ? "h-[230px]" : "h-[292px]"
              } lg:h-[150px]`
        } `}
      >
        <VolumeHorizontal
          hide={hideVolume}
          value={gainMain.current}
        ></VolumeHorizontal>
        <div
          className={`${grid}  ${hideElement} ${animation} w-full h-full gap-y-9 lg:gap-y-0 gap-0.5 absolute -top-0.5 left-0 p-2 py-[26px]`}
        >
          {gain.current.map((data, ch) => {
            return (
              <div className="relative w-full">
                <VolumeMeterV
                  max={127}
                  className="z-10 w-full absolute bottom-0 left-0 h-full"
                  level={data}
                ></VolumeMeterV>
              </div>
            );
          })}
        </div>
        <div
          className={`${grid} ${hideElement} ${animation} w-full gap-0.5 h-full`}
        >
          {volLayout.map((data, ch) => {
            return (
              <div className="flex flex-col relative h-full w-full ">
                <VolumeAction
                  channel={ch + 1}
                  onLock={onLockVolume}
                  isLock={lock[ch]}
                ></VolumeAction>
                <div className="flex items-center justify-center h-full w-full  border-x border-white/20">
                  <RangeBarClone
                    value={hideVolume ? 0 : volumeController[ch]}
                    className="z-20"
                    max={127}
                    onMouseUp={() => updateVolumeHeld(true)}
                    onTouchEnd={() => updateVolumeHeld(false)}
                    onChange={(v) => onVolumeMeterChange(ch, v)}
                  ></RangeBarClone>
                </div>
                <InstrumentsButton
                  channel={ch + 1}
                  instruments={instrument[ch]}
                  onPersetChange={onPersetChange}
                  perset={perset}
                ></InstrumentsButton>
              </div>
            );
          })}
        </div>
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
