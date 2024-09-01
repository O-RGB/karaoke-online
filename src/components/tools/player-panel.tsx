import React, { useEffect } from "react";
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

interface PlayerPanelProps {
  player: Sequencer;
  modalMap: Map<ModalType, React.ReactNode>;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({ player, modalMap }) => {
  const timer = Math.round((player.currentTime / player.duration) * 100);

  useEffect(() => {}, [player.paused]);

  return (
    <>
      <div className="fixed bottom-0 w-full left-0 blur-overlay border-t blur-border flex justify-between p-2 lg:p-0">
        <div className="flex items-center">
          {!player.paused ? (
            <Button
              border=""
              shadow=""
              padding="p-4"
              onClick={() => player.pause()}
              shape={false}
              icon={<TbPlayerPauseFilled className="text-white" />}
            ></Button>
          ) : (
            <Button
              border=""
              shadow=""
              padding="p-4"
              onClick={() => player.play()}
              shape={false}
              icon={<TbPlayerPlayFilled className="text-white" />}
            ></Button>
          )}
          <Button
            border=""
            shadow=""
            padding="p-4"
            onClick={() => player.nextSong()}
            shape={false}
            icon={<TbPlayerSkipForwardFilled className="text-white" />}
          ></Button>
          <div className="px-2 flex items-center w-full">
            <RangeBar
              min={0}
              max={100}
              value={timer}
              layout="horizontal"
              inputProps={{
                className: "w-full lg:w-72",
                disabled: true,
              }}
            ></RangeBar>
          </div>
        </div>
        <div>
          <ContextModal leftClick modal={modalMap} className="">
            <Button
              border=""
              shadow=""
              padding="p-4"
              shape={false}
              icon={<FiSettings className="text-white" />}
            ></Button>
          </ContextModal>
        </div>
      </div>
    </>
  );
};

export default PlayerPanel;
