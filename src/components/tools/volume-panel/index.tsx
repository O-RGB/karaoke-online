import React, { useEffect, useRef, useState } from "react";
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
import { useOrientation } from "@/hooks/orientation-hook";
import { useRemote } from "@/hooks/peer-hook";
import VolumeMeterV from "../../common/volume/volume-meter-v";
import InstrumentsButton from "./instruments-button";
import VolumeAction from "./volume-action";
import VolumeHorizontal from "./volume-horizontal";
import MixMainVolume from "./mix-controller/mix-main-volume";
import useConfigStore from "@/stores/config-store";
import volumeSynth from "@/features/volume/volume-features";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/zoom.css";

interface VolumePanelProps {
  onVolumeChange?: (channel: number, value: number) => void;
  analysers?: AnalyserNode[];
  audioGain?: number[];
  perset?: IPersetSoundfont[];
  options?: React.ReactNode;
  className?: string;
  synth?: Synthetizer;
}

const VolumePanel: React.FC<VolumePanelProps> = ({
  synth,
  onVolumeChange,
  audioGain,
  perset,
  options,
  className,
}) => {
  const VOCAL_CHANNEL = 9;
  const { config } = useConfigStore();
  const widgetConfig = config.widgets;
  const isShow = widgetConfig?.mix?.show;

  const { orientation } = useOrientation();
  const { addNotification } = useNotification();
  const { updateVolumeHeld, updateHideVolume, hideVolume } = useAppControl();
  const { superUserConnections, sendSuperUserMessage } = useRemote();

  const [lock, setLock] = useState<boolean[]>(Array(16).fill(false));
  const volLayout: number[] = Array(16).fill(0);
  const gain = useRef<number[]>(Array(16).fill(0));
  const gainMain = useRef<number>(0);

  const onVolumeMeterChange = (channel: number, value: number) => {
    if (synth) {
      const volumeLib = volumeSynth(synth);
      if (volumeLib) {
        volumeLib.updateMainVolume(channel - 1, value);
      }
    } else {
      onVolumeChange?.(channel, value);
    }
  };

  const onPenChange = (channel: number, value: number) => {
    if (synth) {
      const volumeLib = volumeSynth(synth);
      if (volumeLib) {
        volumeLib.updatePanVolume(channel - 1, value);
      }
    }
  };

  const onPitchChange = (value: number) => {
    if (synth) {
      const volumeLib = volumeSynth(synth);
      if (volumeLib) {
        volumeLib.updatePitch(null, value);
      }
    }
  };

  const onMutedVolume = (channel: number, isMuted: boolean) => {
    if (synth) {
      const volumeLib = volumeSynth(synth);
      if (volumeLib) {
        volumeLib.updateMuteVolume(channel - 1, isMuted);
        setLock((v) => {
          v[channel - 1] = isMuted;
          return v;
        });
      }
    }
  };

  const onLockedVolume = (channel: number, isLocked: boolean) => {
    if (synth) {
      const volumeLib = volumeSynth(synth);
      if (volumeLib) {
        volumeLib.updateLockedVolume(channel - 1, isLocked);
      }
    }
  };

  const onPersetChange = (channel: number, value: number) => {
    if (synth) {
      const volumeLib = volumeSynth(synth);
      if (volumeLib) {
        volumeLib.updatePreset(channel - 1, value);
      }
    }
  };
  const onReverbChange = (channel: number, value: number) => {
    if (synth) {
      const volumeLib = volumeSynth(synth);
      if (volumeLib) {
        volumeLib.updateReverb(channel - 1, value);
      }
    }
  };
  const onChorusDepthChange = (channel: number, value: number) => {
    if (synth) {
      const volumeLib = volumeSynth(synth);
      if (volumeLib) {
        volumeLib.updateChorusDepth(channel - 1, value);
      }
    }
  };

  const onHideVolume = (hide: boolean) => {
    updateHideVolume(hide);
  };

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
  if (isShow === false) {
    return <></>;
  }

  console.log("#### volume panel render")
  return (
    <div
      className={
        className
          ? className
          : `fixed left-0 px-5 flex flex-col gap-1.5 ${
              orientation === "landscape"
                ? " top-[18px] w-70"
                : " top-14 lg:top-6 w-full"
            }`
      }
    >
      <div
        className={` select-none relative z-50 w-full lg:w-fit blur-overlay border blur-border rounded-md p-2 duration-300 ${
          hideVolume
            ? "h-[30px] overflow-hidden"
            : `${
                orientation === "landscape" ? "h-[230px]" : "h-[292px]"
              } lg:h-[150px]`
        } `}
      >
        <VolumeHorizontal hide={hideVolume}></VolumeHorizontal>

        <div
          className={`${grid} ${hideElement} ${animation} w-full h-full gap-y-9 lg:gap-y-0 gap-0.5 absolute -top-[3px]  left-0 p-2 py-[26px]`}
        >
          {volLayout.map((data, ch) => {
            return (
              <div key={`gain-render-${ch}`} className="relative w-full">
                <VolumeMeterV
                  channel={ch}
                  max={127}
                  className="z-10 w-full absolute bottom-0 left-0 h-full"
                  level={data}
                ></VolumeMeterV>
              </div>
            );
          })}
        </div>
        <div
          className={`${grid} ${hideElement} ${animation} ${
            hideVolume ?? "pointer-events-none !cursor-none"
          } w-full gap-0.5 h-full`}
        >
          {volLayout.map((data, ch) => {
            return (
              <div
                key={`vol-panel-${ch}`}
                className="flex flex-col relative h-full w-full"
              >
                <VolumeAction
                  disabled={hideVolume}
                  channel={ch + 1}
                  onMuted={onMutedVolume}
                ></VolumeAction>
                <div className="flex items-center justify-center h-full w-full border-x border-white/20 py-1">
                  <MixMainVolume
                    channel={ch}
                    hideVolume={hideVolume}
                    onChange={(v) => onVolumeMeterChange(ch + 1, v)}
                    onMouseUp={() => updateVolumeHeld(true)}
                    onTouchEnd={() => updateVolumeHeld(false)}
                  ></MixMainVolume>
                </div>

                <InstrumentsButton
                  disabled={hideVolume}
                  channel={ch}
                  onPenChange={onPenChange}
                  onPersetChange={onPersetChange}
                  onReverbChange={onReverbChange}
                  onChorusDepthChange={onChorusDepthChange}
                  perset={perset}
                  onMouseUp={() => updateVolumeHeld(true)}
                  onTouchEnd={() => updateVolumeHeld(false)}
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
              onPitchChange(value);
              addNotification(`Pitch ${value}`);
            }}
            value={0}
            icon={
              <PiMicrophoneStageFill className="text-[15px]"></PiMicrophoneStageFill>
            }
          ></NumberButton>

          <SwitchButton
            onChange={(muted) => onMutedVolume(VOCAL_CHANNEL, !muted)}
            iconOpen={<PiUserSoundFill></PiUserSoundFill>}
            iconClose={<PiUserMinusFill></PiUserMinusFill>}
            labelOpen="Vocal"
            labelClose="Vocal"
          ></SwitchButton>
        </div>
        <div>{options}</div>
      </div>

      <div className="relative flex w-full lg:w-[690px] justify-center items-center h-0 z-10">
        <div className="absolute bottom-[34px] right-4 z-10">
          <Button
            tabIndex={-1}
            shadow={""}
            onClick={() => onHideVolume(!hideVolume)}
            onKeyDown={(event) =>
              event.key === "Enter" && event.preventDefault()
            }
            border="border blur-border focus:outline-none"
            padding=""
            className="px-3 h-4"
            icon={
              <MdArrowDropUp
                className={`${
                  hideVolume ? "rotate-180" : "rotate-0"
                } text-white duration-300 mt-1`}
              ></MdArrowDropUp>
            }
          ></Button>
        </div>
      </div>
    </div>
  );
};

export default VolumePanel;
