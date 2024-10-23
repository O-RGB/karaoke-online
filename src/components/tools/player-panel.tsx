import React, { useEffect, useRef, useState } from "react";
import {
  TbPlayerPauseFilled,
  TbPlayerPlayFilled,
  TbPlayerSkipForwardFilled,
} from "react-icons/tb";
import Button from "../common/button/button";
import RangeBar from "../common/input-data/range-bar";
import { Sequencer } from "spessasynth_lib";
import ContextModal from "../modal/context-modal";
import { FiSettings } from "react-icons/fi";
import Marquee from "react-fast-marquee";
import { FaSearch } from "react-icons/fa";
import useTickStore from "../../stores/tick-store";
import { useSpessasynthStore } from "@/stores/spessasynth-store";
import { useAppControlStore } from "@/stores/player-store";
interface PlayerPanelProps {
  lyrics: string[];
  modalMap: ModalComponents;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({ lyrics, modalMap }) => {
  // re-render
  const tick = useTickStore((state) => state.tick);

  const player = useSpessasynthStore((state) => state.player);
  const currentTime = useSpessasynthStore((state) => state.player?.currentTime);
  const duration = useSpessasynthStore((state) => state.player?.duration);

  const isFinished = useAppControlStore((state) => state.isFinished);
  const paused = useAppControlStore((state) => state.paused);
  const setPaused = useAppControlStore((state) => state.setPaused);

  const [timer, setTimer] = useState<number>(0);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (currentTime && duration) {
      const timer = Math.round((currentTime / duration) * 100);
      setTimer(timer);
    }
  }, [tick, currentTime]);

  if (!player) {
    return <></>;
  }
  return (
    <>
      <div className="fixed bottom-0 w-full left-0 blur-overlay bg-black/10 border-t blur-border flex justify-between p-2 lg:p-0">
        <div className="flex items-center w-full">
          {!isFinished || !paused ? (
            <Button
              blur={false}
              border=""
              shadow=""
              padding="p-4"
              onClick={() => {
                player.pause();
                setPaused(true);
              }}
              shape={false}
              icon={<TbPlayerPauseFilled className="text-white" />}
            ></Button>
          ) : (
            <Button
              blur={false}
              border=""
              shadow=""
              padding="p-4"
              onClick={() => {
                player.play();
                setPaused(false);
              }}
              shape={false}
              icon={<TbPlayerPlayFilled className="text-white" />}
            ></Button>
          )}
          <Button
            blur={false}
            border=""
            shadow=""
            padding="p-4"
            onClick={() => player.nextSong()}
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
                if (duration) {
                  const value = +e.target.value;
                  const newCurrentTime = (value / 100) * duration;
                  player.currentTime = newCurrentTime;
                }
              }}
              type="range"
              className="transition duration-300"
              min={0}
              max={100}
              value={timer}
            ></input>
          </div>
          <div className="hidden lg:block lg:w-full h-full p-1.5">
            <div className="rounded-md bg-black/15 h-full flex items-center py-1 text-white overflow-">
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
          <Button
            className="hidden lg:block"
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
          <ContextModal
            buttonMenu={
              <div className="p-4 flex items-center justify-center">
                <FiSettings className="text-white" />
              </div>
            }
            modal={modalMap}
            className=""
          ></ContextModal>
        </div>
      </div>
    </>
  );
};

export default PlayerPanel;
