"use client";
import React, { useRef, useState } from "react";
import Button from "../../common/button/button";
import useQueuePlayer from "@/features/player/player/modules/queue-player";
import useConfigStore from "@/features/config/config-store";
import useKeyboardStore from "@/features/keyboard-state";
import ContextModal from "../../modal/context-modal";
import TimerBar from "./timer-range";
import { IoMdArrowDropup, IoMdArrowDropdown } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { BsFullscreen, BsFullscreenExit } from "react-icons/bs";
import { FiSettings } from "react-icons/fi";
import { TbPlayerSkipForwardFilled } from "react-icons/tb";
import PlayStatus from "./play-status";
import RecordStatus from "./record";
import SearchButton from "./search";

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
  className?: string;
  style?: React.CSSProperties | undefined;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({
  modalMap,
  isFullScreen,
  onFullScreen,
  show,
  className,
  style,
}) => {
  const [isPlayerVisible, setIsPlayerVisible] = useState<boolean>(true);

  const inputRef = useRef<any>(null);

  const setConfig = useConfigStore((state) => state.setConfig);
  const nextMusic = useQueuePlayer((state) => state.nextMusic);

  const onPlayerShowChange = (isShow: boolean) => {
    setConfig?.({ widgets: { player: { show: isShow } } });
    setIsPlayerVisible(isShow);
  };

  const buttonStyle: any = {
    className: "!rounded-none aspect-square",
    size: "xs",
    color: "white",
    variant: "ghost",
  };

  console.log("[PLATER RERENDER] src/components/tools/player-panel/index.tsx");

  return (
    <>
      <div
        style={{
          transform: isPlayerVisible ? "translateY(0%)" : "translateY(68%)",
        }}
        className="relative transition-all duration-300"
      >
        <div
          className={`flex flex-row-reverse items-end justify-between ${
            !isPlayerVisible ? "pb-16 px-3.5" : ""
          }`}
        >
          <div className={`${isPlayerVisible ? "mr-4" : "mr-1"} mb-1`}>
            <div
              style={{
                opacity: 0.7,
              }}
              className="text-white font-light text-base drop-shadow-md text-right"
            >
              <div className="text-xs opacity-80">v.1.0.30</div>
              <div className="-mt-1 flex items-center justify-center gap-1">
                <img className="h-5 w-5" src="/favicon-96x96.png" />
                Next Karaoke
              </div>
            </div>
          </div>
          <div>
            {!isPlayerVisible && (
              <div className={isPlayerVisible ? `pl-4 -mb-1.5` : ""}>
                <Button
                  {...buttonStyle}
                  className={`${!isPlayerVisible ? "" : "h-5 pb-2"} `}
                  size="xs"
                  blur={{
                    border: true,
                    backgroundColor: "primary",
                  }}
                  onClick={() => onPlayerShowChange(true)}
                  icon={<IoMdArrowDropup />}
                />
              </div>
            )}
            {isPlayerVisible && (
              <div className="pl-4 -mb-1.5">
                <Button
                  {...buttonStyle}
                  className="h-5 pb-2"
                  size="xs"
                  blur={{
                    border: true,
                    backgroundColor: "primary",
                  }}
                  onClick={() => onPlayerShowChange(false)}
                  icon={<IoMdArrowDropdown />}
                  tabIndex={-1}
                ></Button>
              </div>
            )}
          </div>
        </div>
        <div
          style={style}
          className={`${className} w-full flex justify-between z-10 border-t-[0.5px] blur-border blur-overlay`}
        >
          <div className="flex w-full">
            <div className="flex items-center h-full">
              <RecordStatus></RecordStatus>
            </div>

            <div className="flex w-fit ">
              <PlayStatus></PlayStatus>
              <Button
                {...buttonStyle}
                onClick={nextMusic}
                icon={<TbPlayerSkipForwardFilled className="" />}
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
                {...buttonStyle}
                onClick={onFullScreen}
                icon={
                  isFullScreen ? (
                    <BsFullscreenExit className="" />
                  ) : (
                    <BsFullscreen className="" />
                  )
                }
              ></Button>
            )}
            <SearchButton></SearchButton>
            {modalMap && (
              <ContextModal
                buttonMenu={
                  <Button
                    {...buttonStyle}
                    icon={<FiSettings className="" />}
                  ></Button>
                }
                modal={modalMap}
                className=""
              ></ContextModal>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayerPanel;
