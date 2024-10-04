 
// import React, { useEffect, useState } from "react";
// import Modal from "../common/modal";
// import Button from "../common/button/button";
// import { FaComputer, FaRegFileZipper } from "react-icons/fa6";
// import Upload from "../common/input-data/upload";
// import ProgressBar from "../common/progress-bar";
// import SongStorageProcessor from "./song-storage-modal";
// import { TRACKLIST_FILENAME } from "@/config/value";
// import { IoDocumentText } from "react-icons/io5";
// // import { getTrackList, saveTrackList } from "@/lib/storage/tracklist";
// interface WallcomeModalProps {
//   setTracklistFile: (file: File) => Promise<void>;
//   setMusicLibraryFile: (files: Map<string, File>) => void;
//   musicLibrary?: Map<string, File>;
// }

// const WallcomeModal: React.FC<WallcomeModalProps> = ({
//   setMusicLibraryFile,
//   setTracklistFile,
//   musicLibrary,
// }) => {
//   var butSize = "w-full h-56 lg:h-80";

//   const [progress, setProgress] = useState<IProgressBar>();
//   const [onZipFinish, setZipFinsh] = useState<boolean>(false);
//   const [fileSystem, setFileSystem] = useState<boolean>(true);
//   const [songFile, setSongFile] = useState<File>();
//   const [open, setOpen] = useState<boolean>(false);

//   // const dataIsEmpty = async () => {
//   //   const isEmpty = await storageIsEmpty();
//   //   setTimeout(() => {
//   //     setOpen(isEmpty);
//   //   }, 100);
//   //   if (!isEmpty) {
//   //     loadTracklistStorage();
//   //   }
//   // };

//   const loadTracklistStorage = async () => {
//     const file = await getTrackList();
//     if (file) {
//       setTracklistFile(file);
//     }
//   };

//   const checkTracklist = async () => {
//     const res = await getTrackList();
//     if (!res) {
//       setTimeout(() => {
//         setOpen(true);
//       }, 100);
//     } else {
//       loadTracklistStorage();
//     }
//   };

//   const handleClose = (delay: number = 0) => {
//     setTimeout(() => {
//       setOpen(false);
//     }, delay);
//   };

//   // const onLoadFileSystem = async () => {
//   //   const loaded = await loadFileSystem();
//   //   if (loaded) {
//   //     // setTracklistFile(loaded.tracklist);
//   //     // setSongFile(loaded.tracklist);
//   //     setMusicLibraryFile(loaded);
//   //     handleClose(1000);
//   //   }
//   // };

//   const onLoadMusicLibrary = async (_: File, fileList: FileList) => {
//     if (fileList.length === 1) {
//       const file = fileList.item(0);
//       if (file?.type === "application/json") {
//         const saved = await saveTrackList(file);
//         if (saved) {
//           setTracklistFile(file);
//           setSongFile(file);
//         }
//       }
//     }
//   };

//   // const onLoadFileZip = async (_: File, fileList: FileList) => {
//   //   setFileSystem(false);
//   //   const loaded = await loadFileZip(fileList, setProgress);
//   //   if (loaded) {
//   //     setMusicLibraryFile(loaded);
//   //     handleClose(1000);
//   //     setZipFinsh(true);
//   //   }
//   // };

//   // useEffect(() => {
//   //   // checkTracklist();
//   // }, []);
//   return (
//     <>
//       {/* <SongStorageProcessor
//         // tracklist={songFile}
//         musicLibrary={musicLibrary}
//         visible={onZipFinish}
//       ></SongStorageProcessor> */}
//       <Modal
//         title="ตั้งค่าเพลง"
//         isOpen={open}
//         onClose={handleClose}
//         footer={<></>}
//       >
//         {/* {!fileSystem ? (
//           <>
//             {progress?.error ? (
//               <div className="text-sm text-red-500">
//                 Error: {progress.error}
//               </div>
//             ) : (
//               <ProgressBar
//                 progress={progress?.progress ?? 0}
//                 title={progress?.processing}
//               ></ProgressBar>
//             )}
//           </>
//         ) : (
//           <div className="flex gap-2">
//             <Upload
//               inputProps={{
//                 multiple: true,
//               }}
//               className={butSize}
//               onSelectFile={onLoadMusicLibrary}
//             >
//               <Button
//                 border=""
//                 color="white"
//                 shadow=""
//                 className={butSize}
//                 icon={<IoDocumentText className="text-4xl" />}
//               >
//                 SONG
//               </Button>
//             </Upload>
//             <Upload
//               inputProps={{
//                 multiple: true,
//               }}
//               className={butSize}
//               onSelectFile={onLoadFileZip}
//             >
//               <Button
//                 border=""
//                 // onClick={onLoadFileSystem}
//                 color="white"
//                 shadow=""
//                 className={butSize}
//                 icon={<FaComputer className="text-4xl" />}
//               >
//                 SONG
//               </Button>
//             </Upload>
//           </div>
//         )} */}
//         <Upload
//           inputProps={{
//             multiple: true,
//           }}
//           className={butSize}
//           onSelectFile={onLoadMusicLibrary}
//         >
//           <Button
//             border=""
//             color="white"
//             shadow=""
//             className={butSize}
//             icon={<IoDocumentText className="text-4xl" />}
//           >
//             SONG
//           </Button>
//         </Upload>
//       </Modal>
//     </>
//   );
// };

// export default WallcomeModal;
