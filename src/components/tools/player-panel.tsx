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
      <div className="flex items-center gap-2">
        {!player.paused ? (
          <Button
            onClick={() => player.pause()}
            shape={false}
            icon={<TbPlayerPauseFilled className="text-white" />}
          ></Button>
        ) : (
          <Button
            onClick={() => player.play()}
            shape={false}
            icon={<TbPlayerPlayFilled className="text-white" />}
          ></Button>
        )}

        <Button
          onClick={() => player.stop()}
          shape={false}
          icon={<TbPlayerStopFilled className="text-white" />}
        ></Button>
        <Button
          onClick={() => player.nextSong()}
          shape={false}
          icon={<TbPlayerSkipForwardFilled className="text-white" />}
        ></Button>
        <RangeBar
          min={0}
          max={100}
          // defaultValue={0}
          value={timer}
          layout="horizontal"
          inputProps={{
            style: {
              width: 400,
            },
            disabled: true,
          }}
        ></RangeBar>
      </div>
    </>
  );
};

export default PlayerPanel;
