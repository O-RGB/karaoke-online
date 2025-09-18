// import { useSynthesizerEngine } from "@/features/engine/synth-store";
// import React, { useEffect, useState } from "react";
// import UpdateFile from "@/components/common/input-data/upload";
// import Button from "@/components/common/button/button";
// import { FaArrowDown, FaArrowUp, FaTrash, FaInfoCircle } from "react-icons/fa";
// import { MusicQuereFileList } from "@/lib/karaoke/songs/types";
// import { usePlayerSystemStore } from "@/lib/karaoke/store/player";
// import TimingUpdateRender from "./timing";
// import LyricsPlayer from "@/features/lyrics";
// import PlayerPanel from "@/components/tools/player-panel";

// interface KaraokeTestProps {}

// const KaraokeTest: React.FC<KaraokeTestProps> = ({}) => {
//   const groups = usePlayerSystemStore((state) => state.groups);
//   const getGroups = usePlayerSystemStore((state) => state.getGroups);
//   const addMultiple = usePlayerSystemStore((state) => state.addMultiple);
//   const moveUp = usePlayerSystemStore((state) => state.moveUp);
//   const moveDown = usePlayerSystemStore((state) => state.moveDown);
//   const next = usePlayerSystemStore((state) => state.next);
//   const removeAt = usePlayerSystemStore((state) => state.removeAt);
//   const setup = useSynthesizerEngine((state) => state.setup);
//   const engine = useSynthesizerEngine((state) => state.engine);
//   const type = useSynthesizerEngine((state) => state.type);
//   const [summary, setSummary] = useState<string | null>(null);
//   const [fileGroup, setFileGroup] = useState<MusicQuereFileList[]>([]);

//   const onUploadFile = async (_: File, filelist: FileList) => {
//     const files = Array.from(filelist);
//     await addMultiple(files);
//   };

//   const showSummary = (item: MusicQuereFileList) => {
//     console.log(item);
//     const simplifiedMetadata = {
//       info: item.metadata?.info,
//       lyrics: item.lyricsRange,
//       chords: item.metadata?.chords,
//       baseName: item.baseName,
//       files: Array.from(item.files.keys()),
//     };
//     setSummary(JSON.stringify(simplifiedMetadata, null, 2));
//   };

//   const systemStart = async () => {
//     await setup("spessa");
//   };

//   useEffect(() => {
//     systemStart();
//   }, []);

//   const getFileGroup = () => {
//     const list = getGroups();
//     setFileGroup(list);
//   };

//   useEffect(() => {
//     getFileGroup();
//   }, [groups]);

//   useEffect(() => {}, [engine]);

//   if (!engine) return <></>;
//   return (
//     <div className="p-4 space-y-4">
//       engine: {type}
//       <TimingUpdateRender></TimingUpdateRender>
//       <LyricsPlayer></LyricsPlayer>
//       <Button onClick={next}>Next song</Button>
//       <Button onClick={() => engine?.player?.play()}>play</Button>
//       <Button onClick={() => engine?.player?.pause()}>pause</Button>
//       <UpdateFile
//         onSelectFile={(file) => {
//           console.log();
//           engine.setSoundFont(file, "DATABASE_FILE_SYSTEM");
//         }}
//       >
//         <Button>Upload Files (.sf2)</Button>
//       </UpdateFile>
//       <UpdateFile inputProps={{ multiple: true }} onSelectFile={onUploadFile}>
//         <Button>Upload Files</Button>
//       </UpdateFile>
//       <div className="space-y-2">
//         {fileGroup.map((item, index) => (
//           <div
//             key={item.baseName}
//             className="flex items-center justify-between bg-gray-100 rounded-lg p-2"
//           >
//             <span className="truncate">
//               {item.baseName || `File ${index + 1}`}
//             </span>
//             <div className="flex gap-2">
//               <Button
//                 icon={<FaArrowUp size={16} />}
//                 onClick={() => moveUp(index)}
//                 disabled={index === 0}
//               ></Button>
//               <Button
//                 icon={<FaArrowDown size={16} />}
//                 onClick={() => moveDown(index)}
//                 disabled={index === fileGroup.length - 1}
//               ></Button>
//               <Button
//                 icon={<FaTrash size={16} />}
//                 onClick={() => removeAt(index)}
//               ></Button>
//               <Button
//                 icon={<FaInfoCircle size={16} />}
//                 onClick={() => showSummary(item)}
//               ></Button>
//             </div>
//           </div>
//         ))}
//       </div>
//       <PlayerPanel isFullScreen={false}></PlayerPanel>
//       {summary && (
//         <div className="mt-4 p-4 bg-gray-800 text-white rounded-lg">
//           <h3 className="text-lg font-bold mb-2">File Summary</h3>
//           <pre className="overflow-x-auto text-sm">
//             <code>{summary}</code>
//           </pre>
//         </div>
//       )}
//     </div>
//   );
// };

// export default KaraokeTest;
