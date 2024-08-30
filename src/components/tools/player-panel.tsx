import React, { useEffect } from "react";
import {
  TbPlayerPauseFilled,
  TbPlayerPlayFilled,
  TbPlayerSkipForwardFilled,
  TbPlayerStopFilled,
} from "react-icons/tb";
import Button from "../common/button/button";
import RangeBar from "../common/range-bar";
import { Sequencer } from "spessasynth_lib";

interface PlayerPanelProps {
  player: Sequencer;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({ player }) => {
  const timer = Math.round((player.currentTime / player.duration) * 100);

  return (
    <>
      <div className="fixed bottom-0 w-full left-0 blur-overlay border-t blur-border">
        <div className="flex items-center">
          {!player.paused ? (
            <Button
              padding="p-4"
              onClick={() => player.pause()}
              shape={false}
              icon={<TbPlayerPauseFilled className="text-white" />}
            ></Button>
          ) : (
            <Button
              padding="p-4"
              onClick={() => player.play()}
              shape={false}
              icon={<TbPlayerPlayFilled className="text-white" />}
            ></Button>
          )}
          {/* <Button
          onClick={() => player.stop()}
          shape={false}
          icon={<TbPlayerStopFilled className="text-white" />}
        ></Button> */}
          <Button
            padding="p-4"
            onClick={() => player.nextSong()}
            shape={false}
            icon={<TbPlayerSkipForwardFilled className="text-white" />}
          ></Button>
          <div className="px-2 flex items-center w-full">
            <RangeBar
              min={0}
              max={100}
              // defaultValue={0}
              value={timer}
              layout="horizontal"
              inputProps={{
                className: "w-full lg:w-72",
                disabled: true,
              }}
            ></RangeBar>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayerPanel;
