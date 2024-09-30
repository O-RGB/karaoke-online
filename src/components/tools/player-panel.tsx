import React, { useEffect, useState } from "react";
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
interface PlayerPanelProps {
  player: Sequencer;
  lyrics: string[];
  modalMap: ModalComponents;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({
  player,
  lyrics,
  modalMap,
}) => {
  const timer = Math.round((player.currentTime / player.duration) * 100);

  return (
    <>
      <div className="fixed bottom-0 w-full left-0 blur-overlay bg-black/10 border-t blur-border flex justify-between p-2 lg:p-0">
        <div className="flex items-center w-full">
          {!player.paused ? (
            <Button
              blur={false}
              border=""
              shadow=""
              padding="p-4"
              onClick={() => player.pause()}
              shape={false}
              icon={<TbPlayerPauseFilled className="text-white" />}
            ></Button>
          ) : (
            <Button
              blur={false}
              border=""
              shadow=""
              padding="p-4"
              onClick={() => player.play()}
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
          <div className="w-full lg:w-[300px] px-2 flex items-center pt-0.5">
            <RangeBar
              min={0}
              max={100}
              value={timer}
              layout="horizontal"
              inputProps={{
                disabled: true,
              }}
            ></RangeBar>
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
          <Button
            blur={false}
            border=""
            shadow=""
            padding="p-4"
            shape={false}
            icon={<FaSearch className="text-white" />}
          ></Button>
          <ContextModal
            buttonMenu={
              <Button
                blur={false}
                border=""
                shadow=""
                padding="p-4"
                shape={false}
                icon={<FiSettings className="text-white" />}
              ></Button>
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
