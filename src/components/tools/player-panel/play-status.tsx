import Button from "@/components/common/button/button";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { PlayerStatusType } from "@/features/engine/types/synth.type";
import React, { useEffect, useId, useState } from "react";
import { TbPlayerPauseFilled, TbPlayerPlayFilled } from "react-icons/tb";

interface PlayStatusProps {}

const PlayStatus: React.FC<PlayStatusProps> = ({}) => {
  const componnetId = useId();
  const engine = useSynthesizerEngine((state) => state.engine);
  const player = useSynthesizerEngine((state) => state.engine?.player);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatusType>("STOP");
  const onPlayerUpdated = (on: PlayerStatusType) => {
    setPlayerStatus(on);

    if (on === "PLAY") {
      setTimeout(() => {
        engine?.player?.eventChange?.();
      }, 500);
    }
  };

  useEffect(() => {
    if (engine) {
      engine?.playerUpdated.on(
        ["PLAYER", "CHANGE"],
        0,
        onPlayerUpdated,
        componnetId
      );
    }
  }, [engine]);

  const buttonStyle: any = {
    className: "!rounded-none aspect-square",
    size: "xs",
    color: "white",
    variant: "ghost",
  };

  return (
    <>
      {playerStatus === "PLAY" ? (
        <Button
          {...buttonStyle}
          onClick={() => {
            player?.pause();
          }}
          icon={<TbPlayerPauseFilled className="" />}
        ></Button>
      ) : (
        <Button
          {...buttonStyle}
          onClick={() => {
            player?.play();
          }}
          icon={<TbPlayerPlayFilled className="" />}
        ></Button>
      )}
    </>
  );
};

export default PlayStatus;
