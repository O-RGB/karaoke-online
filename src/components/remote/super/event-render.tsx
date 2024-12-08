import useKeyboardStore from "@/stores/keyboard-state";
import useMixerStore from "@/stores/player/mixer-store";
import { usePeerStore } from "@/stores/peer-store";
import React, { useEffect } from "react";
import useQueuePlayer from "@/stores/player/update/modules/queue-player";

interface EventRenderSuperProps {
  setSearchSongList?: (value: SearchResult[]) => void;
  setCurrentTime?: (value: number) => void;
  setSongInfoPlaying?: (value: MidiPlayingInfo) => void;
}

const EventRenderSuper: React.FC<EventRenderSuperProps> = ({
  setSearchSongList,
  setCurrentTime,
  setSongInfoPlaying,
}) => {
  const received = usePeerStore((state) => state.received);

  // MIX
  const setCurrntGain = useMixerStore((state) => state.setCurrntGain);
  const setVolumes = useMixerStore((state) => state.setVolumes);
  const setPan = useMixerStore((state) => state.setPan);
  const setReverb = useMixerStore((state) => state.setReverb);
  const setChorusDepth = useMixerStore((state) => state.setChorusDepth);

  // TIME PLAYING
  // const setCurrentTime = usePlayer((state) => state.setCurrentTime);

  // SONG PLAYER
  // const setPlayingQueue = usePlayer((state) => state.setPlayingQueue);

  const setQueueOpen = useKeyboardStore((state) => state.setQueueOpen);
  const moveQueue = useQueuePlayer((state) => state.moveQueue);

  useEffect(() => {
    if (received) {
      const type = received.content.type;
      const data = received?.content.message;

      // MIX
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
      }

      // TIME PLAYING
      else if (type === "TIME_CHANGE") {
        let currentTime: number = data as number;
        setCurrentTime?.(currentTime);
      }
      // SONG PLAYER
      else if (type === "SEND_SONG_LIST") {
        let songList: SearchResult[] = data as SearchResult[];
        setSearchSongList?.(songList);
      } else if (type === "REQUEST_QUEUE_LIST") {
        let queue: IPlayingDecodedQueues[] = data;
        const songInfo = queue.map((data) => data.songInfo);
        moveQueue(songInfo);
        setQueueOpen?.();
      } else if (type === "SONG_INFO_PLAYING") {
        let midiInfo: MidiPlayingInfo = data as MidiPlayingInfo;
        setSongInfoPlaying?.(midiInfo);
      }
    }
  }, [received?.content]);
  return <></>;
};

export default EventRenderSuper;
