import React, { useEffect, useId, useRef, useState } from "react";
import Button from "../../common/button/button";
import useQueuePlayer from "@/features/player/player/modules/queue-player";
import useConfigStore from "@/features/config/config-store";
import useKeyboardStore from "@/features/keyboard-state";
import RecordingsModal from "../../modal/recordings-modal";
import Modal from "../../common/modal";
import ContextModal from "../../modal/context-modal";
import TimerBar from "./timer-range";
import { BsMicFill } from "react-icons/bs";
import { IoMdArrowDropup, IoMdArrowDropdown } from "react-icons/io";
import { MdRadioButtonChecked } from "react-icons/md";
import { FaFolder, FaMicrophone, FaMusic, FaSearch } from "react-icons/fa";
import { BsFullscreen, BsFullscreenExit } from "react-icons/bs";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import { FiSettings } from "react-icons/fi";
import { PlayerStatusType } from "@/features/engine/types/synth.type";
import {
  TbPlayerPauseFilled,
  TbPlayerPlayFilled,
  TbPlayerSkipForwardFilled,
} from "react-icons/tb";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/zoom.css";

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
  const componnetId = useId();
  const [isPlayerVisible, setIsPlayerVisible] = useState<boolean>(true);
  const [openRecordlist, setRacordlist] = useState<boolean>(false);

  const inputRef = useRef<any>(null);

  const engine = useSynthesizerEngine((state) => state.engine);
  const player = useSynthesizerEngine((state) => state.engine?.player);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatusType>("STOP");

  const onPlayerUpdated = (on: PlayerStatusType) => {
    setPlayerStatus(on);
  };

  useEffect(() => {
    if (engine) {
      engine?.playerUpdated.add(
        ["PLAYER", "CHANGE"],
        0,
        onPlayerUpdated,
        componnetId
      );
    }
  }, [engine]);

  const { setOpenSearchBox } = useKeyboardStore();
  const setConfig = useConfigStore((state) => state.setConfig);
  const nextMusic = useQueuePlayer((state) => state.nextMusic);
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
      handleStopRecording();
    }
  };

  useEffect(() => {
    if (playerStatus === "PLAY") {
      engine?.player?.eventChange?.();
    }
  }, [playerStatus]);

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
                <MenuItem
                  className={"text-sm"}
                  onClick={() => handleStartRecording(true)}
                >
                  <FaMicrophone className="mr-2" /> บันทึกเสียงร้อง + ดนตรี
                </MenuItem>
                <MenuItem
                  className={"text-sm"}
                  onClick={() => handleStartRecording(false)}
                >
                  <FaMusic className="mr-2" /> บันทึกเฉพาะดนตรี
                </MenuItem>
                <MenuItem
                  className={"text-sm"}
                  onClick={() => setRacordlist(true)}
                >
                  <FaFolder className="mr-2" /> บันทึกแล้ว
                </MenuItem>
              </Menu>
            )}
          </div>

          <div className="flex w-fit ">
            {playerStatus === "PLAY" ? (
              <Button
                className="hover:bg-white/20"
                blur={false}
                border=""
                shadow=""
                padding="p-4"
                onClick={() => {
                  player?.pause();
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
                  player?.play();
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
          <TimerBar></TimerBar>
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
