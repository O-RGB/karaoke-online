import React, { useEffect, useRef, useState } from "react";
import {
  TbPlayerPauseFilled,
  TbPlayerPlayFilled,
  TbPlayerSkipForwardFilled,
} from "react-icons/tb";
import Button from "../common/button/button";
import ContextModal from "../modal/context-modal";
import useRuntimePlayer from "@/features/player/player/modules/runtime-player";
import useQueuePlayer from "@/features/player/player/modules/queue-player";
import useConfigStore from "@/features/config/config-store";
import SliderCommon from "../common/input-data/slider";
import useKeyboardStore from "@/features/keyboard-state";
import { FiSettings } from "react-icons/fi";
import { FaRecordVinyl, FaSearch, FaStop } from "react-icons/fa";
import { BsFullscreen, BsFullscreenExit } from "react-icons/bs";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { usePeerStore } from "@/features/remote/modules/peer-js-store";
import { LuMic } from "react-icons/lu";
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

  const nextMusic = useQueuePlayer((state) => state.nextMusic);

  const superUserConnections = usePeerStore.getState().superUserConnections;
  const sendSuperUserMessage = usePeerStore.getState().sendSuperUserMessage;

  const gain =
    useSynthesizerEngine.getState().engine?.instrumental?.getGain() ?? [];

  // --- 🎙️ ส่วนที่เพิ่มเข้ามาสำหรับจัดการการอัดเสียง ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioURL, setRecordedAudioURL] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // ฟังก์ชันเริ่มการอัดเสียง
  const handleStartRecording = async (includeMicrophone: boolean) => {
    if (!engine) return;
    try {
      setRecordedAudioURL(null); // เคลียร์ไฟล์เสียงเก่าก่อนเริ่มอัดใหม่
      await engine.startRecording?.({ includeMicrophone });
      setIsRecording(true);
    } catch (error) {
      console.error("ไม่สามารถเริ่มการบันทึกได้:", error);
      alert("ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาตรวจสอบการอนุญาต");
    }
  };

  // ฟังก์ชันหยุดการอัดเสียง
  const handleStopRecording = async () => {
    if (!engine) return;
    try {
      const audioUrl = await engine.stopRecording?.();
      if (!audioUrl) return;
      setRecordedAudioURL(audioUrl);
      console.log("ไฟล์เสียงที่บันทึก:", audioUrl);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการหยุดบันทึก:", error);
    } finally {
      setIsRecording(false);
    }
  };

  useEffect(() => {
    if (recordedAudioURL && audioRef.current) {
      audioRef.current.play();
    }
  }, [recordedAudioURL]);

  useEffect(() => {
    if (superUserConnections.length > 0) {
      sendSuperUserMessage({
        message: gain,
        user: "SUPER",
        type: {
          type: "GAIN",
          event: "CHANGE",
        },
      });
    }

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

  return (
    <>
      <div className="fixed bottom-0 gap-2 w-full left-0 blur-overlay bg-black/10 border-t blur-border flex justify-between p-2 lg:p-0">
        <div className="flex w-full">
          <div className="flex items-center border-r border-white/20 mr-2">
            {!isRecording ? (
              <>
                <Button
                  title="อัดเสียงดนตรีเท่านั้น"
                  className="hover:bg-white/20"
                  padding="p-4"
                  onClick={() => handleStartRecording(false)}
                  icon={<FaRecordVinyl className="text-white" />}
                />
                <Button
                  title="อัดเสียงดนตรีพร้อมไมค์"
                  className="hover:bg-white/20"
                  padding="p-4"
                  onClick={() => handleStartRecording(true)}
                  icon={<LuMic className="text-white" />}
                />
              </>
            ) : (
              <Button
                title="หยุดการบันทึก"
                className="hover:bg-red-500/50 bg-red-500 animate-pulse"
                padding="p-4"
                onClick={handleStopRecording}
                icon={<FaStop className="text-white" />}
              />
            )}
            {recordedAudioURL && (
              <div className="absolute right-4 bottom-8 bg-gray-800 p-2 rounded-lg shadow-lg w-64">
                <p className="text-white text-sm mb-1">บันทึกเสียงเสร็จสิ้น!</p>
                {/* --- ⏯️ เพิ่ม ref ให้กับ element audio --- */}
                <audio
                  ref={audioRef}
                  controls
                  src={recordedAudioURL}
                  className="w-full"
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
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
          <div className="w-full px-4 pl-8 flex items-center relative">
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
          {/* <div className="col-span-3 hidden lg:block lg:w-fit h-full p-1.5">
            <div className="border border-white/20 rounded-md bg-black/15 h-full flex items-center py-1 text-white w-full overflow-hidden">
              {lyrics.length > 3 && (
                <Marquee
                  className="flex gap-2 opacity-40 text-sm overflow-hidden"
                  speed={10}
                >
                  {lyrics[0]}&nbsp;
                  {lyrics[1]}&nbsp;
                  {lyrics[2]}&nbsp;
                  {lyrics[3]}&nbsp;
                  {lyrics.length > 6 ? (
                    <>
                      {lyrics[4]}&nbsp;
                      {lyrics[5]}&nbsp;
                      {lyrics[6]}&nbsp;
                    </>
                  ) : (
                    <></>
                  )}
                </Marquee>
              )}
            </div>
          </div> */}
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
              // if (inputRef.current) {
              //   inputRef.current.focus();
              // }
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
