import { useOrientation } from "@/hooks/orientation-hook";
import useMixerStoreNew from "@/stores/player/event-player/modules/event-mixer-store";
import useQueuePlayer from "@/stores/player/update/modules/queue-player";
import useRuntimePlayer from "@/stores/player/update/modules/runtime-player";
import React, { useEffect, useState } from "react";

interface NextSongPanelProps {}

const NextSongPanel: React.FC<NextSongPanelProps> = ({}) => {
  const { orientation } = useOrientation();
  const hideMixer = useMixerStoreNew((state) => state.hideMixer);
  const countDown = useRuntimePlayer((state) => state.countDown);
  const queue = useQueuePlayer((state) => state.queue);
  const [saveInfo, setInfo] = useState<SearchResult>();

  useEffect(() => {
    if (queue.length > 0 && countDown <= 3) {
      setInfo(queue[0]);
    } else if (queue.length === 1) {
      setInfo(undefined);
    }
  }, [countDown]);

  if (countDown > 3 || queue.length < 1 || !saveInfo) {
    return <></>;
  }

  return (
    <>
      <div
        className={`fixed ${
          orientation === "landscape"
            ? "top-[60px] lg:top-[90px]"
            : hideMixer
            ? "top-[140px] lg:top-[100px]"
            : "top-[400px] lg:top-[250px]"
        } w-full h-20 px-6 lg:px-20 flex flex-col lg:justify-center items-end lg:items-center gap-2`}
      >
        <div className=" flex justify-center gap-3 lg:gap-10">
          <div
            className={`${
              countDown <= 3 ? "bg-white/70" : "bg-white/20"
            } w-5 lg:w-10 h-5 lg:h-10 rounded-full border flex items-center justify-center text-xs lg:text-xl font-bold text-white`}
          >
            3
          </div>
          <div
            className={`${
              countDown <= 2 ? "bg-white/70" : "bg-white/20"
            } w-5 lg:w-10 h-5 lg:h-10 rounded-full border flex items-center justify-center text-xs lg:text-xl font-bold text-white`}
          >
            2
          </div>
          <div
            className={`${
              countDown <= 1 ? "bg-white/70" : "bg-white/20"
            } w-5 lg:w-10 h-5 lg:h-10 rounded-full border flex items-center justify-center text-xs lg:text-xl font-bold text-white`}
          >
            1
          </div>
        </div>
        <div className="lg:text-xl text-white text-end lg:text-center leading-none lg:leading-normal">
          <span>{saveInfo?.name}</span>
          <br />
          <span className="text-xs lg:text-base">{saveInfo?.artist}</span>
        </div>
      </div>
    </>
  );
};

export default NextSongPanel;
