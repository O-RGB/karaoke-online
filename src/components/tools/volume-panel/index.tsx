import {
  IControllerChange,
  IProgramChange,
} from "@/features/engine/types/synth.type";
import React, { useEffect } from "react";
import Button from "../../common/button/button";
import ChannelVolumeRender from "./renders/volume-meter";
import MainVolumeRender from "./renders/volume-main-render";
import useConfigStore from "@/features/config/config-store";
import useNotificationStore from "@/features/notification-store";
import useKeyboardStore from "@/features/keyboard-state";
import useMixerStoreNew from "@/features/player/event-player/modules/event-mixer-store";
import VolumeOptions from "./modules/options-button/volume-pitch";
import ChannelRender from "./modules/channel";
import { MdArrowDropUp } from "react-icons/md";
import { useOrientation } from "@/hooks/orientation-hook";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/zoom.css";

interface VolumePanelProps {}

const VolumePanel: React.FC<VolumePanelProps> = ({}) => {
  const VOCAL_CHANNEL = 8;

  const engine = useSynthesizerEngine((state) => state.engine);

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
  const updatePitch = useMixerStoreNew((state) => state.updatePitch);

  const onPitchChange = (value: number) => {
    updatePitch(null, value);
  };

  const onSpeedChange = (value: number) => {
    engine?.player?.setPlayBackRate?.(value / 100);
  };

  const onLockChange = (event: IControllerChange<boolean>) => {
    engine?.lockController(event);
  };

  const onMutedVolume = (event: IControllerChange<boolean>) => {
    engine?.setMute(event);
  };

  const onPersetChange = (value: IProgramChange) => {
    engine?.setProgram(value);
  };

  const onControllerChange = (value: IControllerChange) => {
    engine?.setController(value);
  };

  useEffect(() => {}, [engine?.nodes, engine]);

  const grid =
    "grid grid-cols-8 lg:grid-cols-none grid-flow-row lg:grid-flow-col";
  const hideElement = `${hideMixer ? "opacity-0" : "opacity-100"}`;
  const animation = `duration-300 transition-all`;

  if (!engine) return <></>;
  if (!engine?.nodes) return <></>;

  const nodes = engine.nodes;
  return (
    <div
      className={`fixed left-0 px-5 flex flex-col gap-1.5 ${
        orientation === "landscape"
          ? " top-[18px] w-70"
          : " top-[58px] lg:top-6 w-full"
      }`}
    >
      {isShow?.show === true && (
        <div
          className={`select-none relative z-50 w-full lg:w-fit blur-overlay border blur-border rounded-md p-2 duration-300 ${
            hideMixer
              ? "h-[30px] overflow-hidden"
              : `${
                  orientation === "landscape" ? "h-[230px]" : "h-[292px]"
                } lg:h-[150px]`
          } `}
        >
          <MainVolumeRender hide={hideMixer}></MainVolumeRender>

          <div
            className={`${grid} ${hideElement} ${animation} w-full h-full gap-y-9 lg:gap-y-0 gap-0.5 absolute -top-[3px]  left-0 p-2 py-[26px]`}
          >
            {nodes.map((_, ch) => {
              return (
                <div key={`gain-render-${ch}`} className="relative w-full">
                  <ChannelVolumeRender
                    channel={ch}
                    max={127}
                    className="z-10 w-full absolute bottom-0 left-0 h-full"
                  ></ChannelVolumeRender>
                </div>
              );
            })}
          </div>
          <div
            className={`${grid} ${hideElement} ${animation} ${
              hideMixer ?? "pointer-events-none !cursor-none"
            } w-full gap-0.5 h-full`}
          >
            {nodes.map((_, ch) => {
              return (
                <div
                  key={`vol-panel-${ch}`}
                  className="flex flex-col relative h-full"
                >
                  <ChannelRender
                    node={_}
                    onLockChange={onLockChange}
                    onMutedVolume={onMutedVolume}
                    isShow={hideMixer}
                    channel={ch}
                    onProgramChange={onPersetChange}
                    onChange={onControllerChange}
                    perset={instrument}
                  ></ChannelRender>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {engine && (
        <VolumeOptions
          onPitchChange={onPitchChange}
          onSpeedChange={onSpeedChange}
          onMutedVolume={onMutedVolume}
          setNotification={setNotification}
          openQueue={() => {
            setQueueOpen?.();
            resetQueueingTimeout(5000);
          }}
          vocal={VOCAL_CHANNEL}
          nodes={engine.nodes}
        ></VolumeOptions>
      )}

      {isShow?.show === true && (
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
      )}
    </div>
  );
};

export default VolumePanel;
