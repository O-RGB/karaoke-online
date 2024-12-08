import React, { useEffect, useRef, useState } from "react";
import {
  TbPlayerPauseFilled,
  TbPlayerPlayFilled,
  TbPlayerSkipForwardFilled,
} from "react-icons/tb";
import Button from "../common/button/button";
import ContextModal from "../modal/context-modal";
import { FiSettings } from "react-icons/fi";
import Marquee from "react-fast-marquee";
import { FaSearch } from "react-icons/fa";
import { useFullScreenHandle } from "react-full-screen";

import { BsFullscreen, BsFullscreenExit } from "react-icons/bs";
import useRuntimePlayer from "@/stores/player/update/modules/runtime-player";
import useQueuePlayer from "@/stores/player/update/modules/queue-player";
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
  const [timer, setTimer] = useState<number>(0);
  const inputRef = useRef<any>(null);

  const isPaused = useRuntimePlayer((state) => state.isPaused);
  const lyrics = useRuntimePlayer((state) => state.lyrics);
  const paused = useRuntimePlayer((state) => state.paused);
  const play = useRuntimePlayer((state) => state.play);
  const setCurrentTime = useRuntimePlayer((state) => state.setCurrentTime);
  const currentTime = useRuntimePlayer((state) => state.currentTime);
  const midi = useRuntimePlayer((state) => state.midi);

  const queue = useQueuePlayer((state) => state.queue);
  const nextMusic = useQueuePlayer((state) => state.nextMusic);

  useEffect(() => {
    const timer = Math.round((currentTime / (midi?.duration ?? 0)) * 100);
    setTimer(timer);
  }, [currentTime, midi]);

  // if (show !== true) {
  //   return <></>;
  // }
  return (
    <>
      <div className="fixed bottom-0 gap-2 w-full left-0 blur-overlay bg-black/10 border-t blur-border flex justify-between p-2 lg:p-0">
        <div className="flex items-center w-full">
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
            disabled={queue.length <= 1}
            border=""
            shadow=""
            padding="p-4"
            onClick={nextMusic}
            shape={false}
            icon={<TbPlayerSkipForwardFilled className="text-white" />}
          ></Button>
          <div className="w-full lg:w-[300px]  px-2 flex items-center pt-0.5">
            <input
              // disabled
              style={{
                width: "100%",
              }}
              tabIndex={-1}
              onChange={(e) => {
                const value = +e.target.value;
                setCurrentTime(value);
              }}
              type="range"
              className="transition duration-300"
              min={0}
              max={100}
              value={timer}
            ></input>
          </div>
          <div className="hidden lg:block lg:w-full h-full p-1.5">
            <div className="border border-white/20 rounded-md bg-black/15 h-full flex items-center py-1 text-white overflow-hidden">
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
              if (inputRef.current) {
                inputRef.current.focus();
              }
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
