import React, { useEffect, useId, useState, useCallback } from "react";
import { useOrientation } from "@/hooks/orientation-hook";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import {
  IControllerChange,
  IProgramChange,
} from "@/features/engine/types/synth.type";
import { IoMdArrowDropup } from "react-icons/io";
import { usePeerHostStore } from "@/features/remote/store/peer-js-store";
import Button from "../../common/button/button";
import MainVolumeRender from "./renders/volume-main-render";
import useConfigStore from "@/features/config/config-store";
import useKeyboardStore from "@/features/keyboard-state";
import useMixerStoreNew from "@/features/player/event-player/modules/event-mixer-store";
import VolumeOptions from "./modules/options-button/volume-pitch";
import ChannelRender from "./modules/channel";
import NotesChannelRender from "./renders/notes";
import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/zoom.css";

/* -------------------------------------------------------------------------- */
/* Sub-Components                               */
/* -------------------------------------------------------------------------- */

// 1. แยกปุ่ม Toggle ออกมาและ Memoize
interface MixerToggleButtonProps {
  hideMixer: boolean;
  onToggle: () => void;
}

const MixerToggleButton = React.memo(
  ({ hideMixer, onToggle }: MixerToggleButtonProps) => {
    return (
      <div className="absolute -bottom-[13px] right-4 z-10">
        <Button
          tabIndex={-1}
          size="xs"
          className="!h-5 !pb-2"
          blur={{
            border: true,
            backgroundColor: "primary",
          }}
          onClick={onToggle}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          icon={
            <IoMdArrowDropup
              className={`${
                hideMixer ? "rotate-180" : "rotate-0"
              } duration-300 mt-1`}
            />
          }
        />
      </div>
    );
  }
);

// 2. แยก Layer การแสดงผล Note (Visualizer)
const NotesLayer = React.memo(
  ({
    nodes,
    isYoutube,
    hideMixer,
  }: {
    nodes: SynthChannel[];
    isYoutube: boolean;
    hideMixer: boolean;
  }) => {
    if (hideMixer) return null; // ไม่ Render ถ้าถูกซ่อน
    return (
      <div className="grid grid-cols-8 lg:grid-cols-none grid-flow-row lg:grid-flow-col opacity-100 duration-300 transition-all w-full h-full gap-y-9 lg:gap-y-0 gap-0.5 absolute -top-[3px] left-0 p-2 py-[26px]">
        {nodes.map((node, ch) => (
          <div
            key={`gain-render-${ch}`}
            className="relative w-full flex-wrap text-wrap"
          >
            <div className="z-10 w-full absolute bottom-0 left-0 h-full">
              <NotesChannelRender
                node={node}
                stop={isYoutube}
                noteModifier={node.noteModifier}
                row={16}
                col={8}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
);

// 3. แยก Layer ปุ่มควบคุม (Controls)
const ControlsLayer = React.memo(
  ({
    nodes,
    hideMixer,
    preset,
    onLockChange,
    onMutedVolume,
    onPersetChange,
    onControllerChange,
  }: {
    nodes: SynthChannel[];
    hideMixer: boolean;
    preset: IPersetSoundfont[];
    onLockChange: (event: IControllerChange<boolean>) => void;
    onMutedVolume: (event: IControllerChange<boolean>) => void;
    onPersetChange: (value: IProgramChange) => void;
    onControllerChange: (value: IControllerChange) => void;
  }) => {
    const className = `grid grid-cols-8 lg:grid-cols-none grid-flow-row lg:grid-flow-col w-full gap-0.5 h-full duration-300 transition-all ${
      hideMixer ? "opacity-0 pointer-events-none !cursor-none" : "opacity-100"
    }`;

    return (
      <div className={className}>
        {!hideMixer &&
          nodes.map((node, ch) => (
            <div
              key={`vol-panel-${ch}`}
              className="flex flex-col relative h-full"
            >
              <ChannelRender
                node={node}
                onLockChange={onLockChange}
                onMutedVolume={onMutedVolume}
                isShow={hideMixer}
                channel={ch}
                onProgramChange={onPersetChange}
                onChange={onControllerChange}
                perset={preset}
              />
            </div>
          ))}
      </div>
    );
  }
);

/* -------------------------------------------------------------------------- */
/* Main Component                               */
/* -------------------------------------------------------------------------- */

interface VolumePanelProps {}

const VolumePanel: React.FC<VolumePanelProps> = ({}) => {
  const VOCAL_CHANNEL = 8;
  const componentId = useId();
  const engine = useSynthesizerEngine((state) => state.engine);
  const isShow = useConfigStore((state) => state.config.widgets?.mix);

  const [isYoutube, setIsYoutube] = useState<boolean>(false);
  const clientMaster = usePeerHostStore((state) => state.sendToMaster);
  const setQueueOpen = useKeyboardStore((state) => state.setQueueOpen);
  const resetQueueingTimeout = useKeyboardStore(
    (state) => state.resetQueueingTimeout
  );

  const [preset, setPreset] = useState<IPersetSoundfont[]>([]);
  const orientation = useOrientation().orientation;
  const hideMixer = useMixerStoreNew((state) => state.hideMixer);
  const setHideMixer = useMixerStoreNew((state) => state.setHideMixer);

  // Callbacks
  const onPitchChange = useCallback(
    (value: number) => {
      engine?.updatePitch(null, value);
      clientMaster("system/vocal", { vocal: value });
    },
    [engine, clientMaster]
  );

  const onSpeedChange = useCallback(
    (value: number) => {
      engine?.updateSpeed?.(value);
      clientMaster("system/speed", { speed: value });
    },
    [engine, clientMaster]
  );

  const onLockChange = useCallback(
    (event: IControllerChange<boolean>) => {
      engine?.lockController(event);
    },
    [engine]
  );

  const onMutedVolume = useCallback(
    (event: IControllerChange<boolean>) => {
      engine?.setMute(event);
    },
    [engine]
  );

  const onPersetChange = useCallback(
    (value: IProgramChange) => {
      engine?.setProgram(value);
    },
    [engine]
  );

  const onControllerChange = useCallback(
    (value: IControllerChange) => {
      engine?.setController(value);
    },
    [engine]
  );

  const handleToggleMixer = useCallback(() => {
    setHideMixer(!hideMixer);
  }, [hideMixer, setHideMixer]);

  const handleOpenQueue = useCallback(() => {
    setQueueOpen?.();
    resetQueueingTimeout(5000);
  }, [setQueueOpen, resetQueueingTimeout]);

  // Effects
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

  useEffect(() => {
    if (!engine) return;
    engine.sfPreset?.on(["SF_PRESET", "CHANGE"], 0, setPreset, componentId);
    engine.musicUpdated?.on(
      ["MUSIC", "CHANGE"],
      0,
      (event) => setIsYoutube(event.musicType === "YOUTUBE"),
      componentId
    );
    return () => {
      engine.sfPreset?.off(["SF_PRESET", "CHANGE"], 0, componentId);
      engine.musicUpdated?.off(["MUSIC", "CHANGE"], 0, componentId);
    };
  }, [engine, componentId]);

  if (!engine || !engine.nodes) return <></>;
  const nodes = engine.nodes;

  const containerHeight = hideMixer
    ? "h-[35px] overflow-hidden"
    : `${orientation === "landscape" ? "h-[230px]" : "h-[292px]"} lg:h-[150px]`;

  return (
    <div
      className={`flex w-full ${
        hideMixer
          ? "flex-row landscape:w-[45%]"
          : "flex-col-reverse landscape:w-fit"
      } gap-2 `}
    >
      <VolumeOptions
        isYoutube={isYoutube}
        onPitchChange={onPitchChange}
        onSpeedChange={onSpeedChange}
        onMutedVolume={onMutedVolume}
        openQueue={handleOpenQueue}
        vocal={VOCAL_CHANNEL}
        nodes={nodes}
      />

      {isShow?.show === true && (
        <div className="relative w-full">
          <div
            className={`select-none relative z-20 w-full blur-overlay border blur-border rounded-md p-2 duration-300 ${containerHeight}`}
          >
            {/* Main Visualizer */}
            <MainVolumeRender stop={isYoutube} hide={!hideMixer} />

            {/* Notes Visualizer Layer */}
            <NotesLayer
              nodes={nodes}
              isYoutube={isYoutube}
              hideMixer={hideMixer}
            />

            {/* Controls Layer */}
            <ControlsLayer
              nodes={nodes}
              hideMixer={hideMixer}
              preset={preset}
              onLockChange={onLockChange}
              onMutedVolume={onMutedVolume}
              onPersetChange={onPersetChange}
              onControllerChange={onControllerChange}
            />
          </div>

          {/* Toggle Button Isolated */}
          <MixerToggleButton
            hideMixer={hideMixer}
            onToggle={handleToggleMixer}
          />
        </div>
      )}
    </div>
  );
};

export default VolumePanel;
