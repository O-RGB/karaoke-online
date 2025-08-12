import React, { useEffect, useRef, useState } from "react";
import {
  TbPlayerPauseFilled,
  TbPlayerPlayFilled,
  TbPlayerSkipForwardFilled,
} from "react-icons/tb";
import { BsMicFill, BsMicMuteFill } from "react-icons/bs";
import { IoMdArrowDropup, IoMdArrowDropdown } from "react-icons/io";
import { MdRadioButtonChecked } from "react-icons/md";
import Button from "../common/button/button";
import useRuntimePlayer from "@/features/player/player/modules/runtime-player";
import useQueuePlayer from "@/features/player/player/modules/queue-player";
import useConfigStore from "@/features/config/config-store";
import SliderCommon from "../common/input-data/slider";
import useKeyboardStore from "@/features/keyboard-state";
import { FaFolder, FaMicrophone, FaMusic, FaSearch } from "react-icons/fa";
import { BsFullscreen, BsFullscreenExit } from "react-icons/bs";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/zoom.css";
import RecordingsModal from "../modal/recordings-modal";
import Modal from "../common/modal";
import { FiSettings } from "react-icons/fi";
import ContextModal from "../modal/context-modal";

interface PlayerRemote {
  onPause?: () => void;
  onPlay?: () => void;
  nextSong?: () => void;
}

interface PlayerPanelProps extends PlayerRemote {
  isFullScreen: boolean;
  modalMap?: ModalComponents;
  onFullScreen?: () => void;
  show?: boolean;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({
  modalMap,
  isFullScreen,
  onFullScreen,
  show,
}) => {
  const timingMode =
    useConfigStore((state) => state.config.system?.timingModeType) ?? "Time";
  const [maxTimer, setMaxTimer] = useState<number>(0);
  const [value, setValue] = useState<number>(0);
  const [isPlayerVisible, setIsPlayerVisible] = useState<boolean>(true);
  const [openRecordlist, setRacordlist] = useState<boolean>(false);

  const inputRef = useRef<any>(null);

  const engine = useSynthesizerEngine((state) => state.engine);
  const isPaused = useRuntimePlayer((state) => state.isPaused);
  const paused = useRuntimePlayer((state) => state.paused);
  const play = useRuntimePlayer((state) => state.play);
  const setCurrentTime = useRuntimePlayer((state) => state.setCurrentTime);
  const currentTime = useRuntimePlayer((state) => state.currentTime);
  const currentTick = useRuntimePlayer((state) => state.currentTick);
  const midi = useRuntimePlayer((state) => state.midi);
  const { setOpenSearchBox } = useKeyboardStore();
  const setConfig = useConfigStore((state) => state.setConfig);

  const nextMusic = useQueuePlayer((state) => state.nextMusic);

  const gain =
    useSynthesizerEngine.getState().engine?.instrumental?.getGain() ?? [];

  const [isRecording, setIsRecording] = useState(false);

  const handleStartRecording = async (includeMicrophone: boolean) => {
    if (!engine) return;
    try {
      await engine.startRecording?.({ includeMicrophone });
      setIsRecording(true);
    } catch (error) {
      console.error("ไม่สามารถเริ่มการบันทึกได้:", error);
      alert(
        `ไม่สามารถเริ่มการบันทึกได้: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const handleStopRecording = async () => {
    if (!engine) return;
    try {
      await engine.stopRecording?.();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการหยุดบันทึก:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      alert(`การบันทึกเสียงล้มเหลว: ${errorMessage}`);
    } finally {
      setIsRecording(false);
    }
  };

  const handleRecordButtonClick = () => {
    if (isRecording) {
      // หยุดการบันทึก
      handleStopRecording();
    }
    // หากไม่ได้บันทึกอยู่ จะไม่ทำอะไร เพราะให้ Menu จัดการแทน
  };

  useEffect(() => {
    if (midi) {
      if (timingMode === "Tick") {
        setMaxTimer(midi.loop.end);
        setValue(currentTick);
      } else if (timingMode === "Time") {
        setMaxTimer(midi.duration);
        setValue(currentTime);
      }
    }
  }, [midi, timingMode, currentTime, currentTick]);

  useEffect(() => {
    engine?.player?.eventChange?.();
  }, [isPaused]);

  const onPlayerShowChange = (isShow: boolean) => {
    setConfig?.({ widgets: { player: { show: isShow } } });
    setIsPlayerVisible(isShow);
  };

  return (
    <>
      <Modal
        isOpen={openRecordlist}
        onClose={() => setRacordlist(false)}
        title="บันทึก"
      >
        <RecordingsModal></RecordingsModal>
      </Modal>
      {!isPlayerVisible && (
        <div
          className="fixed bottom-4 left-4 z-50"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <Button
            border="border blur-border focus:outline-none "
            onClick={() => onPlayerShowChange(true)}
            blur={true}
            shadow=""
            className="rounded-md"
            padding="p-2"
            shape={false}
            icon={<IoMdArrowDropup className="text-white text-xl" />}
          />
        </div>
      )}
      {isPlayerVisible && (
        <div
          className="fixed left-2 z-50"
          style={{ bottom: "calc(42px + env(safe-area-inset-bottom))" }}
        >
          <Button
            tabIndex={-1}
            shadow={""}
            onClick={() => onPlayerShowChange(false)}
            border="border blur-border bg-white focus:outline-none"
            padding=""
            className="px-2 h-3"
            icon={<IoMdArrowDropdown className="text-black" />}
          ></Button>
        </div>
      )}

      <div
        className={`w-full blur-overlay bg-black/10 border-t blur-border flex justify-between transition-all duration-300`}
        style={{
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
          paddingBottom: "env(safe-area-inset-bottom)",
          transform: !isPlayerVisible ? "translateY(100%)" : "translateY(0)",
          opacity: !isPlayerVisible ? 0 : 1,
        }}
      >
        <div className="flex w-full">
          <div className="flex items-center">
            {/* Recording Button - แยกการทำงานออกจาก Menu */}
            {isRecording ? (
              // เมื่อกำลังบันทึกอยู่ - แสดงปุ่มหยุด
              <Button
                className="hover:bg-white/20 bg-red-500/50 animate-pulse relative overflow-hidden"
                blur={false}
                border=""
                shadow=""
                padding="p-4"
                onClick={handleRecordButtonClick}
                shape={false}
                icon={
                  <MdRadioButtonChecked className="text-red-400 animate-pulse" />
                }
              >
                {/* Pulsing recording indicator */}
                <div className="absolute inset-0 bg-red-500/20 animate-ping rounded-full"></div>
              </Button>
            ) : (
              // เมื่อไม่ได้บันทึก - แสดง Menu
              <Menu
                transition
                boundingBoxPadding="10 10 10 10"
                menuButton={
                  <MenuButton>
                    <Button
                      className="hover:bg-white/20"
                      blur={false}
                      border=""
                      shadow=""
                      padding="p-4"
                      shape={false}
                      icon={<BsMicFill className="text-white" />}
                    />
                  </MenuButton>
                }
              >
                <MenuItem  className={"text-sm"} onClick={() => handleStartRecording(true)}>
                  <FaMicrophone className="mr-2" /> บันทึกเสียงร้อง + ดนตรี
                </MenuItem>
                <MenuItem className={"text-sm"} onClick={() => handleStartRecording(false)}>
                  <FaMusic className="mr-2" /> บันทึกเฉพาะดนตรี
                </MenuItem>
                <MenuItem className={"text-sm"} onClick={() => setRacordlist(true)}>
                  <FaFolder className="mr-2" /> บันทึกแล้ว
                </MenuItem>
              </Menu>
            )}
          </div>

          <div className="flex w-fit ">
            {!isPaused ? (
              <Button
                className="hover:bg-white/20"
                blur={false}
                border=""
                shadow=""
                padding="p-4"
                onClick={() => {
                  paused();
                }}
                shape={false}
                icon={<TbPlayerPauseFilled className="text-white" />}
              ></Button>
            ) : (
              <Button
                className="hover:bg-white/20"
                blur={false}
                border=""
                shadow=""
                padding="p-4"
                onClick={() => {
                  play();
                }}
                shape={false}
                icon={<TbPlayerPlayFilled className="text-white" />}
              ></Button>
            )}
            <Button
              className="hover:bg-white/20"
              blur={false}
              border=""
              shadow=""
              padding="p-4"
              onClick={nextMusic}
              shape={false}
              icon={<TbPlayerSkipForwardFilled className="text-white" />}
            ></Button>
          </div>
          <div className="w-full flex items-center relative pl-3 px-2">
            <SliderCommon
              tabIndex={-1}
              value={value}
              min={0}
              max={maxTimer}
              style={{
                width: "100%",
              }}
              onChange={setCurrentTime}
            ></SliderCommon>
          </div>
        </div>

        <div className="flex">
          <div className="absolute -z-50 opacity-0 pointer-events-none">
            <input
              type="text"
              ref={inputRef}
              onBlur={() => {
                if (inputRef.current) {
                  inputRef.current.value = "";
                }
              }}
            />
          </div>

          {document.fullscreenEnabled && (
            <Button
              className="hover:bg-white/20"
              onClick={onFullScreen}
              blur={false}
              border=""
              shadow=""
              padding="p-4"
              shape={false}
              icon={
                isFullScreen ? (
                  <BsFullscreenExit className="text-white" />
                ) : (
                  <BsFullscreen className="text-white" />
                )
              }
            ></Button>
          )}

          <Button
            className="hidden lg:block hover:bg-white/20"
            onClick={() => {
              setOpenSearchBox?.(true);
            }}
            blur={false}
            border=""
            shadow=""
            padding="p-4"
            shape={false}
            icon={<FaSearch className="text-white" />}
          ></Button>
          {modalMap && (
            <ContextModal
              buttonMenu={
                <div className="p-4 flex items-center justify-center hover:bg-white/20 duration-300">
                  <FiSettings className="text-white" />
                </div>
              }
              modal={modalMap}
              className=""
            ></ContextModal>
          )}
        </div>
      </div>
    </>
  );
};

export default PlayerPanel;
