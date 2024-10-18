// "use client";

// import { createContext, FC, useState } from "react";
// import { convertCursorToTicks, mapCursorToIndices } from "@/lib/app-control";
// import { MIDI } from "spessasynth_lib";

// import { fixMidiHeader } from "@/lib/karaoke/ncn";
// import React from "react";
// import { getSong } from "@/lib/storage/song";
// import { AiOutlineLoading } from "react-icons/ai";
// import { useSpessasynthStore } from "@/stores/spessasynth-store";
// import useConfigStore from "@/stores/config-store";
// import useNotificationStore from "@/stores/notification-store";

// type AppControlContextType = {
//   setPlayingTrackFile: (value: SearchResult) => void;
//   setMusicLibraryFile: (files: Map<string, File>) => void;
//   handleSetLyrics: (lyr: string[]) => void;
//   setSongPlaying: (files: SongFilesDecode) => Promise<void>;
//   loadAndPlaySong: (value: SearchResult) => Promise<void>;
//   musicLibrary: Map<string, File>;
//   playingTrack: SearchResult | undefined;
//   cursorIndices: Map<number, number[]> | undefined;
//   lyrics: string[];
//   cursorTicks: number[];
//   midiPlaying: MIDI | undefined;
// };

// type AppControlProviderProps = {
//   children: React.ReactNode;
// };

// export const AppControlContext = createContext<AppControlContextType>({
//   setPlayingTrackFile: async () => {},
//   setMusicLibraryFile: async () => {},
//   handleSetLyrics: () => {},
//   setSongPlaying: async () => {},
//   loadAndPlaySong: async () => {},
//   lyrics: [],
//   cursorTicks: [],
//   musicLibrary: new Map(),
//   cursorIndices: new Map(),
//   playingTrack: undefined,
//   midiPlaying: undefined,
// });

// export const AppControlProvider: FC<AppControlProviderProps> = ({
//   children,
// }) => {
//   // zustand state
//   const player = useSpessasynthStore((state) => state.player);
//   // zustand state
//   const System = useConfigStore((state) => state.config.system?.drive);
//   // zustand state
//   const setNotification = useNotificationStore(
//     (state) => state.setNotification
//   );

//   // Song File System
//   const [musicLibrary, setMusicLibrary] = useState<Map<string, File>>(
//     new Map()
//   );

//   // Playing Song
//   // --- Song
//   const [playingTrack, setPlayingTrack] = useState<SearchResult>();
//   const [midiPlaying, setMidiPlaying] = useState<MIDI>();

//   // --- Lyrics
//   const [lyrics, setLyrics] = useState<string[]>([]);
//   const [cursorTicks, setCursor] = useState<number[]>([]);
//   const [cursorIndices, setCursorIndices] = useState<Map<number, number[]>>();

//   const handleSetLyrics = (lyr: string[]) => {
//     setLyrics(lyr);
//   };

//   const handleSetCursor = (ticksPerBeat: number, cursor: number[]) => {
//     if (!player) {
//       return;
//     }
//     const cur = convertCursorToTicks(ticksPerBeat, cursor);
//     const curMapping = mapCursorToIndices(cur);
//     setCursorIndices(curMapping);
//     setCursor(cur);
//   };

//   const setMusicLibraryFile = (files: Map<string, File>) => {
//     setMusicLibrary(files);
//   };

//   const setPlayingTrackFile = (value: SearchResult) => {
//     setPlayingTrack(value);
//   };

//   const setSongPlaying = async (files: SongFilesDecode) => {
//     if (!player) {
//       return;
//     }
//     player.pause();
//     player.stop();
//     handleSetLyrics([]);
//     handleSetCursor(0, []);

//     let midiFileArrayBuffer = await files.mid.arrayBuffer();
//     let parsedMidi = null;
//     try {
//       parsedMidi = new MIDI(midiFileArrayBuffer, files.mid.name);
//     } catch (e) {
//       let error: string = (e as string).toString();
//       let typeError: string = `SyntaxError: Invalid MIDI Header! Expected "MThd", got`;
//       console.error(error);
//       // if (error === typeError) {
//       const fix = await fixMidiHeader(files.mid);
//       const fixArrayBuffer = await fix.arrayBuffer();
//       parsedMidi = new MIDI(fixArrayBuffer, fix.name);
//       // }
//     }

//     if (parsedMidi) {
//       setTimeout(async () => {
//         setMidiPlaying(parsedMidi);
//         const timeDivision = parsedMidi.timeDivision;
//         handleSetLyrics(files.lyr);
//         handleSetCursor(timeDivision, files.cur);
//         player.loadNewSongList([parsedMidi]);
//         player.play();
//       }, 1000);
//     }
//   };

//   const loadAndPlaySong = async (value: SearchResult) => {
//     let mode: string = "";
//     if (System) {
//       mode = " Drive";
//     } else {
//       mode = "ระบบ";
//     }

//     setNotification({
//       text: "กำลังโหลดจาก" + mode,
//       delay: 40000,
//       icon: <AiOutlineLoading className="animate-spin"></AiOutlineLoading>,
//     });
//     const song = await getSong(value, System);
//     if (song) {
//       setSongPlaying(song);
//       setNotification({ text: "เสร็จสิ้น" });
//     } else {
//       setNotification({ text: "ไม่พบเพลงใน" + mode });
//     }
//   };

//   return (
//     <AppControlContext.Provider
//       value={{
//         setPlayingTrackFile,
//         setMusicLibraryFile,
//         handleSetLyrics,
//         setSongPlaying,
//         loadAndPlaySong,
//         lyrics,
//         cursorTicks,
//         musicLibrary,
//         playingTrack,
//         cursorIndices,
//         midiPlaying,
//       }}
//     >
//       <>{children}</>
//     </AppControlContext.Provider>
//   );
// };
