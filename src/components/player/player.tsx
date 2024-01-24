import {
  Flex,
  IconButton,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from "@chakra-ui/react";
import { RxLoop, RxPause, RxPlay, RxStop } from "react-icons/rx";

import usePlayer from "../../hooks/usePlayer";
import styles from "./player.module.css";

// Bar
interface PlayerBarProps {
  currentTick: number;
  totalTicks: number;
  onSeek: (tick: number) => void;
  isDisabled?: boolean;
}

// const PlayerBar = ({
//   currentTick,
//   totalTicks,
//   onSeek,
//   isDisabled,
// }: PlayerBarProps) => {
//   return (
//     <Slider
//       aria-label="slider"
//       colorScheme="pink"
//       value={currentTick}
//       onChange={(value) => {
//         onSeek(value);
//       }}
//       max={totalTicks}
//       width={"100%"}
//       isDisabled={isDisabled}
//     >
//       <SliderTrack bg={"purple.100"}>
//         <SliderFilledTrack bg={"purple.500"} />
//       </SliderTrack>
//       <SliderThumb />
//     </Slider>
//   );
// };

// Player
export default function Player() {
  const player = usePlayer();
  const canPlay = player.soundFont && player.midi;

  return (
    <div className="">
      {/* <PlayerBar
        currentTick={player.currentTick}
        totalTicks={player.totalTicks}
        onSeek={player.seek}
        isDisabled={!canPlay}
      /> */}

      <div
        className="flex gap-2 items-center cursor-pointer"
        onClick={async () => {
          player.setRepeat(!player.repeat);
        }}
      >
        <div className="p-2">
          <RxLoop />
        </div>
        <div>Click to Loop soung</div>
      </div>
      {/* <IconButton
          aria-label="Loop"
          className={styles.btn}
          icon={<RxLoop />}
          color={"white"}
          bg={player.repeat ? "purple.500" : "transparent"}
          _hover={{ bg: player.repeat ? "purple.500" : "whiteAlpha.300" }}
          onClick={async () => {
            player.setRepeat(!player.repeat);
          }}
        /> */}

      <div
        className="flex gap-2 items-center cursor-pointer"
        onClick={async () => {
          player.setPlaying(!player.playing);
        }}
      >
        <div className="p-2">{player.playing ? <RxPause /> : <RxPlay />}</div>
        <div>{player.playing ? "Play" : "Stop"}</div>
      </div>
      {/* <IconButton
          aria-label="Resume/Pause"
          className={styles.btn}
          icon={player.playing ? <RxPause /> : <RxPlay />}
          isDisabled={!canPlay}
          onClick={async () => {
            player.setPlaying(!player.playing);
          }}
        /> */}

      <div
        className="flex gap-2 items-center cursor-pointer"
        onClick={async () => {
          player.setPlaying(false);
          player.seek(0);
        }}
      >
        <div className="p-2">
          <RxStop />
        </div>
        <div>End</div>
      </div>

      {/* <IconButton
          aria-label="Stop"
          className={styles.btn}
          icon={<RxStop />}
          isDisabled={!canPlay}
          onClick={async () => {
            player.setPlaying(false);
            player.seek(0);
          }}
        /> */}
    </div>
  );
}
