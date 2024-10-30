import React, { useEffect, useRef, useState } from "react";
import { Synthetizer } from "spessasynth_lib";
import {
  PiMicrophoneStageFill,
  PiUserMinusFill,
  PiUserSoundFill,
} from "react-icons/pi";
import NumberButton from "../../common/input-data/number-button";
import SwitchButton from "../../common/input-data/switch/switch-button";
import Button from "../../common/button/button";
import { MdArrowDropUp } from "react-icons/md";
import { useOrientation } from "@/hooks/orientation-hook";
import VolumeMeterV from "../../common/volume/volume-meter-v";
import InstrumentsButton from "./instruments-button";
import VolumeAction from "./volume-action";
import VolumeHorizontal from "./volume-horizontal";
import MixMainVolume from "./mix-controller/mix-main-volume";
import useConfigStore from "@/stores/config-store";
import volumeSynth from "@/features/volume/volume-features";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/zoom.css";
import useMixerStore from "@/stores/mixer-store";
import useNotificationStore from "@/stores/notification-store";
import { FaList } from "react-icons/fa";
import useKeyboardStore from "@/stores/keyboard-state";
import { useSpessasynthStore } from "@/stores/spessasynth-store";

interface VolumePanelProps {
  onVolumeChange?: (channel: number, value: number) => void;
  onOpenQueue?: () => void;
  analysers?: AnalyserNode[];
  audioGain?: number[];
  options?: React.ReactNode;
  className?: string;
}

const VolumePanel: React.FC<VolumePanelProps> = ({
  onVolumeChange,
  onOpenQueue,
  audioGain,
  options,
  className,
}) => {
  const VOCAL_CHANNEL = 9;
  const isShow = useConfigStore((state) => state.config.widgets?.mix);
  const setQueueOpen = useKeyboardStore((state) => state.setQueueOpen);
  const resetQueueingTimeout = useKeyboardStore(
    (state) => state.resetQueueingTimeout
  );
  const perset = useSpessasynthStore((state) => state.perset);

  const { orientation } = useOrientation();
  const setNotification = useNotificationStore(
    (state) => state.setNotification
  );
  const hideMixer = useMixerStore((state) => state.hideMixer);
  const setHideMixer = useMixerStore((state) => state.setHideMixer);
  const setHeld = useMixerStore((state) => state.setHeld);
  const synth = useSpessasynthStore((state) => state.synth);

  const [lock, setLock] = useState<boolean[]>(Array(16).fill(false));
  const volLayout: number[] = Array(16).fill(0);

  const volumeLib = synth ? volumeSynth(synth) : undefined;

  const onVolumeMeterChange = (channel: number, value: number) => {
    if (synth) {
      volumeLib?.updateMainVolume(channel - 1, value);
    } else {
      onVolumeChange?.(channel - 1, value);
    }
  };

  const onPenChange = (channel: number, value: number) => {
    volumeLib?.updatePanVolume(channel - 1, value);
  };

  const onPitchChange = (value: number) => {
    volumeLib?.updatePitch(null, value);
  };

  const onMutedVolume = (channel: number, isMuted: boolean) => {
    if (volumeLib) {
      volumeLib.updateMuteVolume(channel - 1, isMuted);
      setLock((v) => {
        v[channel - 1] = isMuted;
        return v;
      });
    }
  };

  const onLockedVolume = (channel: number, isLocked: boolean) => {
    volumeLib?.updateLockedVolume(channel - 1, isLocked);
  };
  const onPersetChange = (channel: number, value: number) => {
    volumeLib?.updatePreset(channel - 1, value);
  };
  const onReverbChange = (channel: number, value: number) => {
    volumeLib?.updateReverb(channel - 1, value);
  };
  const onChorusDepthChange = (channel: number, value: number) => {
    volumeLib?.updateChorusDepth(channel - 1, value);
  };

  const grid =
    "grid grid-cols-8 lg:grid-cols-none grid-flow-row lg:grid-flow-col";
  const hideElement = `${hideMixer ? "opacity-0" : "opacity-100"}`;
  const animation = `duration-300 transition-all`;

  if (isShow?.show === false) {
    return <></>;
  }

  console.log("#### volume panel render");
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
          hideMixer
            ? "h-[30px] overflow-hidden"
            : `${
                orientation === "landscape" ? "h-[230px]" : "h-[292px]"
              } lg:h-[150px]`
        } `}
      >
        <VolumeHorizontal hide={hideMixer}></VolumeHorizontal>

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
                  level={audioGain ? audioGain[ch] : data}
                ></VolumeMeterV>
              </div>
            );
          })}
        </div>
        <div
          className={`${grid} ${hideElement} ${animation} ${
            hideMixer ?? "pointer-events-none !cursor-none"
          } w-full gap-0.5 h-full`}
        >
          {volLayout.map((data, ch) => {
            console.log("map re loop...");
            return (
              <div
                key={`vol-panel-${ch}`}
                className="flex flex-col relative h-full "
              >
                <VolumeAction
                  disabled={hideMixer}
                  channel={ch + 1}
                  onMuted={onMutedVolume}
                ></VolumeAction>
                <div className="flex items-center justify-center h-full w-full border-x border-white/20 py-1">
                  <MixMainVolume
                    channel={ch}
                    disabled={hideMixer}
                    onChange={(v) => onVolumeMeterChange(ch + 1, v)}
                    onMouseUp={() => setHeld(true)}
                    onTouchEnd={() => setHeld(false)}
                  ></MixMainVolume>
                </div>

                <InstrumentsButton
                  disabled={hideMixer}
                  channel={ch}
                  onPenChange={onPenChange}
                  onPersetChange={onPersetChange}
                  onReverbChange={onReverbChange}
                  onChorusDepthChange={onChorusDepthChange}
                  perset={perset}
                  onMouseUp={() => setHeld(true)}
                  onTouchEnd={() => setHeld(false)}
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
              setNotification({ text: `Pitch ${value}` });
            }}
            value={0}
            icon={
              <PiMicrophoneStageFill className="text-[15px]"></PiMicrophoneStageFill>
            }
          ></NumberButton>

          <SwitchButton
            onChange={(muted) => {
              onMutedVolume(VOCAL_CHANNEL, !muted);
            }}
            iconOpen={<PiUserSoundFill className="text-lg"></PiUserSoundFill>}
            iconClose={<PiUserMinusFill className="text-lg"></PiUserMinusFill>}
            colorClose="red"
          ></SwitchButton>
          <SwitchButton
            onChange={(muted) => {
              onOpenQueue?.();
              setQueueOpen?.();
              resetQueueingTimeout(5000);
            }}
            iconOpen={<FaList></FaList>}
            iconClose={<FaList></FaList>}
          ></SwitchButton>
        </div>
        <div>{options}</div>
      </div>

      <div className="relative flex w-full lg:w-[620px] justify-center items-center h-0 z-10">
        <div className="absolute bottom-[33px] right-4 z-10">
          <Button
            tabIndex={-1}
            shadow={""}
            onClick={() => setHideMixer(!hideMixer)}
            onKeyDown={(event) =>
              event.key === "Enter" && event.preventDefault()
            }
            border="border blur-border focus:outline-none"
            padding=""
            className="px-3 h-4"
            icon={
              <MdArrowDropUp
                className={`${
                  hideMixer ? "rotate-180" : "rotate-0"
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
