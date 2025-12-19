import Button from "../../common/button/button";
import MainVolumeRender from "./renders/volume-main-render";
import useConfigStore from "@/features/config/config-store";
import useNotificationStore from "@/features/notification-store";
import useKeyboardStore from "@/features/keyboard-state";
import useMixerStoreNew from "@/features/player/event-player/modules/event-mixer-store";
import VolumeOptions from "./modules/options-button/volume-pitch";
import ChannelRender from "./modules/channel";
import React, { useEffect, useId, useState } from "react";
import { useOrientation } from "@/hooks/orientation-hook";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import {
  IControllerChange,
  IProgramChange,
} from "@/features/engine/types/synth.type";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/zoom.css";
import { IoMdArrowDropup } from "react-icons/io";
import NotesChannelRender from "./renders/notes";
import { usePeerHostStore } from "@/features/remote/store/peer-js-store";

interface VolumePanelProps {}

const VolumePanel: React.FC<VolumePanelProps> = ({}) => {
  const VOCAL_CHANNEL = 8;

  const componentId = useId();
  const engine = useSynthesizerEngine((state) => state.engine);
  const isShow = useConfigStore((state) => state.config.widgets?.mix);

  const client = usePeerHostStore((state) => state.requestToClient);
  const setQueueOpen = useKeyboardStore((state) => state.setQueueOpen);
  const resetQueueingTimeout = useKeyboardStore(
    (state) => state.resetQueueingTimeout
  );

  const [preset, setPreset] = useState<IPersetSoundfont[]>([]);
  const { orientation } = useOrientation();
  const setNotification = useNotificationStore(
    (state) => state.setNotification
  );
  const hideMixer = useMixerStoreNew((state) => state.hideMixer);
  const setHideMixer = useMixerStoreNew((state) => state.setHideMixer);

  const onPitchChange = (value: number) => {
    engine?.updatePitch(null, value);
    client(null, "system/vocal", { vocal: value }, { role: "master" });
  };

  const onSpeedChange = (value: number) => {
    engine?.updateSpeed?.(value);
    client(null, "system/speed", { speed: value }, { role: "master" });
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

  useEffect(() => {
    const handleResize = () => {
      setHideMixer(true);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [setHideMixer]);

  const grid =
    "grid grid-cols-8 lg:grid-cols-none grid-flow-row lg:grid-flow-col";
  const hideElement = `${hideMixer ? "opacity-0" : "opacity-100"}`;
  const animation = `duration-300 transition-all`;

  useEffect(() => {
    engine?.sfPreset?.on(["SF_PRESET", "CHANGE"], 0, setPreset, componentId);
    return () => {
      engine?.sfPreset?.off(["SF_PRESET", "CHANGE"], 0, componentId);
    };
  }, [engine?.sfPreset]);

  if (!engine) return <></>;
  if (!engine?.nodes) return <></>;

  const nodes = engine.nodes;

  return (
    <div
      className={`flex w-full ${
        hideMixer
          ? "flex-row landscape:w-[45%]"
          : "flex-col-reverse landscape:w-fit"
      } gap-2 `}
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
                    <div
                      key={`gain-render-${ch}`}
                      className="relative w-full flex-wrap text-wrap"
                    >
                      <div className="z-10 w-full absolute bottom-0 left-0 h-full">
                        <NotesChannelRender
                          noteModifier={_.noteModifier}
                          row={16}
                          col={8}
                        ></NotesChannelRender>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div
              className={`${grid} ${hideElement} ${animation} ${
                hideMixer ?? "pointer-events-none !cursor-none"
              } w-full gap-0.5 h-full `}
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
                        perset={preset}
                      ></ChannelRender>
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="absolute -bottom-[13px] right-4 z-10">
            <Button
              tabIndex={-1}
              size="xs"
              className="!h-5 !pb-2"
              blur={{
                border: true,
                backgroundColor: "primary",
              }}
              onClick={() => setHideMixer(!hideMixer)}
              onKeyDown={(event) =>
                event.key === "Enter" && event.preventDefault()
              }
              icon={
                <IoMdArrowDropup
                  className={`${
                    hideMixer ? "rotate-180" : "rotate-0"
                  } duration-300 mt-1`}
                ></IoMdArrowDropup>
              }
            ></Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolumePanel;
