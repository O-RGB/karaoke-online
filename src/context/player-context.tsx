// "use client";
// import { useAppControl } from "@/hooks/app-control-hook";
// import { useSynth } from "@/hooks/spessasynth-hook";
// import {
//   calculateTicks,
//   convertTicksToTime,
//   sortTempoChanges,
// } from "@/lib/app-control";
// import React, {
//   createContext,
//   FC,
//   useRef,
//   useState,
//   useCallback,
//   useEffect,
// } from "react";

// type PlayerContextType = {
//   tick: number;
//   tempo: number;
//   displayLyrics?: DisplayLyrics;
// };

// type PlayerProviderProps = {
//   children: React.ReactNode;
// };

// export const PlayerContext = createContext<PlayerContextType>({
//   displayLyrics: undefined,
//   tick: 0,
//   tempo: 0,
// });

// export const PlayerProvider: FC<PlayerProviderProps> = ({ children }) => {
//   const { midiPlaying } = useAppControl();
//   const { player } = useSynth();

//   const [tick, setTick] = useState<number>(0);
//   const [tempo, setTempo] = useState<number>(0);

//   const tempoChanges = useRef<ITempoChange[]>([]);
//   const timeList = useRef<ITempoTimeChange[]>([]);
//   const timeDivision = useRef<number>(0);
 
//   useEffect(() => {
//     timeDivision.current = midiPlaying?.timeDivision ?? 0;
//     let tempos = midiPlaying?.tempoChanges ?? [];
//     tempos = tempos.slice(0, -1).reverse();
//     tempos = sortTempoChanges(tempos);
//     tempoChanges.current = tempos;
//     timeList.current = convertTicksToTime(timeDivision.current, tempos);
//   }, [midiPlaying]);

//   return (
//     <PlayerContext.Provider
//       value={{
//         tempo,
//         tick,
//       }}
//     >
//       {children}
//     </PlayerContext.Provider>
//   );
// };
