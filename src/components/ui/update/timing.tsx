// import { useSynthesizerEngine } from "@/features/engine/synth-store";
// import React, { useEffect, useId, useState } from "react";

// interface TimingUpdateRenderProps {}

// const TimingUpdateRender: React.FC<TimingUpdateRenderProps> = ({}) => {
//   const componnetId = useId();
//   const engine = useSynthesizerEngine((state) => state.engine);
//   const musicQuere = useSynthesizerEngine(
//     (state) => state.engine?.player?.musicQuere
//   );

//   const [tick, setTick] = useState<number>(0);
//   const [tempo, setTempo] = useState<number>(0);
//   const [countdown, setCountDown] = useState<number>(0);

//   const onTickUpdated = (tick: number) => {
//     setTick(tick);
//   };

//   const onTempoUpdated = (tempo: number) => {
//     setTempo(tempo);
//   };
//   const onCountDownUpdated = (tempo: number) => {
//     setCountDown(tempo);
//   };

//   useEffect(() => {
//     if (engine) {
//       engine?.timerUpdated.add(
//         ["TIMING", "CHANGE"],
//         0,
//         onTickUpdated,
//         componnetId
//       );
//       engine?.tempoUpdated.add(
//         ["BPM", "CHANGE"],
//         0,
//         onTempoUpdated,
//         componnetId
//       );
//       engine?.countdownUpdated.add(
//         ["COUNTDOWN", "CHANGE"],
//         0,
//         onCountDownUpdated,
//         componnetId
//       );
//     }
//   }, [engine]);

//   useEffect(() => {
//     if (!engine?.player?.paused) {
//     } else {
//     }

//     engine?.onPlay(() => {
//       engine?.player?.eventChange?.();
//       console.log(" engine?.onPlay...");
//     });

//     engine?.onStop(() => {
//       console.log("engine?.onStop...");
//     });
//   }, [engine?.player?.paused]);

//   return (
//     <>
//       <div>tick: {tick}</div>
//       <div>tempo: {JSON.stringify(tempo)}</div>
//       <div>countdown: {JSON.stringify(countdown)}</div>
//       <div>{JSON.stringify(musicQuere?.lyricsRange?.search(tick))}</div>
//     </>
//   );
// };

// export default TimingUpdateRender;
