import useKeyboardStore from "@/stores/keyboard-state";
import useMixerStore from "@/stores/mixer-store";
import { usePeerStore } from "@/stores/peer-store";
import { usePlayer } from "@/stores/player-store";
import React, { useEffect, useState } from "react";

interface EventRenderSuperProps {
  setSongList?: (value: any) => void;
}

const EventRenderSuper: React.FC<EventRenderSuperProps> = ({ setSongList }) => {
  const received = usePeerStore((state) => state.received);

  const setCurrntGain = useMixerStore((state) => state.setCurrntGain);
  const setVolumes = useMixerStore((state) => state.setVolumes);
  const setPan = useMixerStore((state) => state.setPan);
  const setReverb = useMixerStore((state) => state.setReverb);
  const setChorusDepth = useMixerStore((state) => state.setChorusDepth);
  const setPlayingQueue = usePlayer((state) => state.setPlayingQueue);
  const setQueueOpen = useKeyboardStore((state) => state.setQueueOpen);

  useEffect(() => {
    if (received) {
      const type = received.content.type;
      const data = received?.content.message;

      if (type === "GIND_NODE") {
        let gain: number[] = data;
        setCurrntGain(gain);
      } else if (type === "VOLUMES") {
        let volumes: number[] = data;
        console.log(volumes);
        setVolumes(volumes);
      } else if (type === "PAN") {
        let pan: number[] = data;
        setPan(pan);
      } else if (type === "REVERB") {
        let reverb: number[] = data;
        setReverb(reverb);
      } else if (type === "CHORUSDEPTH") {
        let chorusDepth: number[] = data;
        setChorusDepth(chorusDepth);
      } else if (type === "SEND_SONG_LIST") {
        setSongList?.(data);
      } else if (type === "REQUEST_QUEUE_LIST") {
        let queue: IPlayingDecodedQueues[] = data;
        console.log("queue", queue);
        setPlayingQueue(queue);
        setQueueOpen?.();
      }
    }
  }, [received?.content]);
  return <></>;
};

export default EventRenderSuper;
