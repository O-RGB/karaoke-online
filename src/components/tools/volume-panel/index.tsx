import React from "react";
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
import useConfigStore from "@/stores/config/config-store";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/zoom.css";
import useNotificationStore from "@/stores/notification-store";
import { FaList } from "react-icons/fa";
import useKeyboardStore from "@/stores/keyboard-state";
import useMixerStoreNew from "@/stores/player/event-player/modules/event-mixer-store";
import { CHANNEL_DEFAULT } from "@/config/value";

interface VolumePanelProps {
  onVolumeChange?: (value: ISetChannelGain) => void;
  onRemotePenChange?: (value: ISetChannelGain) => void;
  onRemotePitchChange?: (value: number) => void;
  onRemoteMutedVolume?: (value: ISetMuteChannel) => void;
  onRemotePersetChange?: (value: ISetChannelGain) => void;
  onRemoteReverbChange?: (value: ISetChannelGain) => void;
  onRemoteChorusDepthChange?: (value: ISetChannelGain) => void;
  onOpenQueue?: () => void;
  audioGain?: number[];
  options?: React.ReactNode;
  className?: string;
  show?: boolean;
}

const VolumePanel: React.FC<VolumePanelProps> = ({
  onVolumeChange,
  onRemotePenChange,
  onRemotePitchChange,
  onRemoteMutedVolume,
  onRemotePersetChange,
  onRemoteReverbChange,
  onRemoteChorusDepthChange,
  onOpenQueue,
  audioGain,
  options,
  className,
  show,
}) => {
  const VOCAL_CHANNEL = 9;
  const isShow = useConfigStore((state) => state.config.widgets?.mix);
  const setQueueOpen = useKeyboardStore((state) => state.setQueueOpen);
  const resetQueueingTimeout = useKeyboardStore(
    (state) => state.resetQueueingTimeout
  );
  const instrument = useMixerStoreNew((state) => state.instrument);

  const { orientation } = useOrientation();
  const setNotification = useNotificationStore(
    (state) => state.setNotification
  );
  const hideMixer = useMixerStoreNew((state) => state.hideMixer);

  const setHideMixer = useMixerStoreNew((state) => state.setHideMixer);

  const setVolLock = useMixerStoreNew((state) => state.setVolLock);
  const setVolumes = useMixerStoreNew((state) => state.setVolumes);
  const setPan = useMixerStoreNew((state) => state.setPan);
  const setReverb = useMixerStoreNew((state) => state.setReverb);
  const setChorusDepth = useMixerStoreNew((state) => state.setChorusDepth);
  const updatePitch = useMixerStoreNew((state) => state.updatePitch);
  const updatePreset = useMixerStoreNew((state) => state.updatePreset);
  const setMute = useMixerStoreNew((state) => state.setMute);

  const onVolumeMeterChange = (channel: number, value: number) => {
    setVolumes(channel - 1, value, true);

    if (onVolumeChange) {
      onVolumeChange?.({ channel, value });
    }
  };

  const onPenChange = (channel: number, value: number) => {
    setPan(channel - 1, value, true);
  };

  const onPitchChange = (value: number) => {
    updatePitch(null, value);

    if (onRemotePitchChange) {
      onRemotePitchChange(value);
    }
  };

  const onMutedVolume = (channel: number, isMuted: boolean) => {
    setMute(channel - 1, isMuted);

    if (onRemoteMutedVolume) {
      onRemoteMutedVolume({ channel: channel - 1, mute: isMuted });
    }
  };

  const onPersetChange = (channel: number, value: number) => {
    updatePreset(channel - 1, value);
  };
  const onReverbChange = (channel: number, value: number) => {
    setReverb(channel - 1, value, true);
  };
  const onChorusDepthChange = (channel: number, value: number) => {
    setChorusDepth(channel - 1, value, true);
  };

  const grid =
    "grid grid-cols-8 lg:grid-cols-none grid-flow-row lg:grid-flow-col";
  const hideElement = `${hideMixer ? "opacity-0" : "opacity-100"}`;
  const animation = `duration-300 transition-all`;

  if (isShow?.show === false && show !== true) {
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
        className={`select-none relative z-50 w-full lg:w-fit blur-overlay border blur-border rounded-md p-2 duration-300 ${
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
          {CHANNEL_DEFAULT.map((data, ch) => {
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
          {CHANNEL_DEFAULT.map((data, ch) => {
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
                <div className="flex items-center justify-center h-full py-1.5 w-full border-x border-white/20">
                  <MixMainVolume
                    channel={ch}
                    disabled={hideMixer}
                    onChange={(v) => onVolumeMeterChange(ch + 1, v)}
                  ></MixMainVolume>
                </div>

                <InstrumentsButton
                  disabled={hideMixer}
                  channel={ch}
                  volRender={
                    <div className="w-full">
                      <MixMainVolume
                        vertical={false}
                        channel={ch}
                        disabled={hideMixer}
                        onChange={(v) => onVolumeMeterChange(ch + 1, v)}
                      ></MixMainVolume>
                    </div>
                  }
                  onMainlock={(ch, locked) => setVolLock(ch, locked, true)}
                  onPenChange={onPenChange}
                  onPersetChange={onPersetChange}
                  onReverbChange={onReverbChange}
                  onChorusDepthChange={onChorusDepthChange}
                  perset={instrument}
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
