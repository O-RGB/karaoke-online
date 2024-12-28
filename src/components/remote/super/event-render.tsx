// import useKeyboardStore from "@/stores/keyboard-state";
// import React, { useEffect } from "react";
// import useQueuePlayer from "@/stores/player/player/modules/queue-player";
// import useMixerStoreNew from "@/stores/player/event-player/modules/event-mixer-store";
// import { usePeerStore } from "@/stores/remote/modules/peer-js-store";

// interface EventRenderSuperProps {
//   setSearchSongList?: (value: SearchResult[]) => void;
//   setCurrentTime?: (value: number) => void;
//   setSongInfoPlaying?: (value: MidiPlayingInfo) => void;
// }

// const EventRenderSuper: React.FC<EventRenderSuperProps> = ({
//   setSearchSongList,
//   setCurrentTime,
//   setSongInfoPlaying,
// }) => {
//   const received = usePeerStore((state) => state.received);

//   // MIX
//   const setCurrntGain = useMixerStoreNew((state) => state.setCurrntGain);
//   // const setVolumes = useMixerStoreNew((state) => state.setVolumes);
//   // const setPan = useMixerStoreNew((state) => state.setPan);
//   // const setReverb = useMixerStoreNew((state) => state.setReverb);
//   // const setChorusDepth = useMixerStoreNew((state) => state.setChorusDepth);

//   // TIME PLAYING
//   // const setCurrentTime = usePlayer((state) => state.setCurrentTime);

//   // SONG PLAYER
//   // const setPlayingQueue = usePlayer((state) => state.setPlayingQueue);

//   const setQueueOpen = useKeyboardStore((state) => state.setQueueOpen);
//   const moveQueue = useQueuePlayer((state) => state.moveQueue);

//   useEffect(() => {
//     if (received) {
//       const type = received.content.type;
//       const data = received?.content.message;

//       //channel: number, value: number, synthUpdate: boolean

//       // MIX
//       if (type === "GIND_NODE") {
//         let gain: number[] = data;
//         setCurrntGain(gain);
//       } else if (type === "VOLUMES") {
//         let { channel, value } = data;
//         setVolumes(channel, value, true);
//       } else if (type === "PAN") {
//         let { channel, value } = data;
//         setPan(channel, value, true);
//       } else if (type === "REVERB") {
//         let { channel, value } = data;
//         setReverb(channel, value, true);
//       } else if (type === "CHORUSDEPTH") {
//         let { channel, value } = data;
//         setChorusDepth(channel, value, true);
//       }

//       // TIME PLAYING
//       else if (type === "TIME_CHANGE") {
//         let currentTime: number = data as number;
//         setCurrentTime?.(currentTime);
//       }
//       // SONG PLAYER
//       else if (type === "SEND_SONG_LIST") {
//         let songList: SearchResult[] = data as SearchResult[];
//         setSearchSongList?.(songList);
//       } else if (type === "REQUEST_QUEUE_LIST") {
//         let queue: SearchResult[] = data;
//         moveQueue(queue);
//         setQueueOpen?.();
//       } else if (type === "SONG_INFO_PLAYING") {
//         let midiInfo: MidiPlayingInfo = data as MidiPlayingInfo;
//         setSongInfoPlaying?.(midiInfo);
//       }
//     }
//   }, [received?.content]);
//   return <></>;
// };

// export default EventRenderSuper;
