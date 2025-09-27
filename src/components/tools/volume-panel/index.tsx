import Button from "../../common/button/button";
import ChannelVolumeRender from "./renders/volume-meter";
import MainVolumeRender from "./renders/volume-main-render";
import useConfigStore from "@/features/config/config-store";
import useNotificationStore from "@/features/notification-store";
import useKeyboardStore from "@/features/keyboard-state";
import useMixerStoreNew from "@/features/player/event-player/modules/event-mixer-store";
import VolumeOptions from "./modules/options-button/volume-pitch";
import ChannelRender from "./modules/channel";
import InstrumentalPanel from "../instrumental-panel";
import React, { useEffect } from "react";
import { MdArrowDropUp } from "react-icons/md";
import { useOrientation } from "@/hooks/orientation-hook";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import {
  IControllerChange,
  IProgramChange,
} from "@/features/engine/types/synth.type";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/zoom.css";

interface VolumePanelProps {}

const VolumePanel: React.FC<VolumePanelProps> = ({}) => {
  const VOCAL_CHANNEL = 8;

  const engine = useSynthesizerEngine((state) => state.engine);

  const isShow = useConfigStore((state) => state.config.widgets?.mix);
  const showInst = useConfigStore((state) => state.config.widgets?.inst);

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
    engine?.updateSpeed?.(value);
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
      className={`flex w-full ${
        hideMixer
          ? "flex-row landscape:w-[45%]"
          : "flex-col-reverse landscape:w-fit"
      } gap-1.5 `}
    >
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
        <div className="relative w-full">
          <div
            className={`select-none relative z-20 w-full blur-overlay border blur-border rounded-md p-2 duration-300 
              ${
                hideMixer
                  ? "h-[35px] overflow-hidden"
                  : `${
                      orientation === "landscape" ? "h-[230px]" : "h-[292px]"
                    } lg:h-[150px]`
              }`}
          >
            <MainVolumeRender hide={!hideMixer}></MainVolumeRender>

            <div
              className={`${grid} ${hideElement} ${animation} w-full h-full gap-y-9 lg:gap-y-0 gap-0.5 absolute -top-[3px]  left-0 p-2 py-[26px]`}
            >
              {!hideMixer &&
                nodes.map((_, ch) => {
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
              {!hideMixer &&
                nodes.map((_, ch) => {
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

          <div className="relative flex w-full justify-center items-center h-0 z-20">
            <div className="absolute -bottom-[10px] right-4 z-10">
              <Button
                tabIndex={-1}
                size="xs"
                className="!p-0 !w-10"
                blur={{
                  border: true,
                  backgroundColor: "primary",
                }}
                onClick={() => setHideMixer(!hideMixer)}
                onKeyDown={(event) =>
                  event.key === "Enter" && event.preventDefault()
                }
                icon={
                  <MdArrowDropUp
                    className={`${
                      hideMixer ? "rotate-180" : "rotate-0"
                    } duration-300 text-lg`}
                  ></MdArrowDropUp>
                }
              ></Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolumePanel;
