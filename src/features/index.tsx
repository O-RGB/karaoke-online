// import { usePeerStore } from "@/stores/peer-store";
// import { useSpessasynthStore } from "@/stores/spessasynth-store";
// import useVolumeFeature from "./volume/volume-features";
// import useTracklistStore from "@/stores/tracklist-store";
// import usePlayerFeature from "./player/player-features";

// interface Feature {
//   volume: FeatureSynth;
//   tracklist: TrackListStore;
// }

// export const useFeatures = (): Feature | null => {
//   const { received, sendMessage } = usePeerStore();
//   const { synth, player } = useSpessasynthStore();

//   if (!synth || !player) {
//     return null;
//   }
//   const volume = useVolumeFeature(synth);
//   const players = usePlayerFeature(player);

//   if (!volume || !players) {
//     return null;
//   }

//   const { tracklist, setTracklist } = useTracklistStore();

//   return {
//     volume,
//     tracklist: {
//       tracklist,
//       setTracklist,
//     },
//   };
// };
