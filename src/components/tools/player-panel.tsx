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
import { getMidiInfo, getTicks } from "@/lib/mixer";

interface PlayerPanelProps {
  player: Sequencer;
  modalMap: ModalComponents;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({
  player,
  modalMap,
  // cursor,
}) => {
  // const [ticks, setTicks] = useState<number>(0);
  // const [curTime, setCur] = useState<number>(0);
  const timer = Math.round((player.currentTime / player.duration) * 100);

  // const calculateTicksFromCur = () => {
  //   const midInfo = getMidiInfo(player);
  //   cursor = cursor.map((data) => data * ((midInfo?.ticksPerBeat ?? 0) / 24));
  //   console.log(cursor);
  // };

  // const MidiTickCalculator = () => {
  //   const tick = getTicks(player);
  //   setTicks(tick ?? 0);
  // };

  // useEffect(() => {
  //   MidiTickCalculator();
  // }, [player.currentTime]);

  // useEffect(() => {
  //   calculateTicksFromCur();
  // }, [player.paused]);

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
          {/* <div className="flex gap-2">
            <div className="p-1 border text-white overflow-hidden text-nowrap">
              currentTime: {Math.round(player.currentTime)}
            </div>
            <div className="p-1 border text-white overflow-hidden text-nowrap">
              duration: {Math.round(player.duration)}
            </div>
            <div className="p-1 border text-white overflow-hidden text-nowrap">
              ticks: {Math.round(ticks)}
            </div>
            <div className="p-1 border text-white overflow-hidden text-nowrap">
              curTime: {Math.round(curTime)}
            </div>
          </div> */}
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
