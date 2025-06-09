// import Button from "@/components/common/button/button";
// import Label from "@/components/common/display/label";
// import TableList from "@/components/common/table/table-list";
// import SearchDropdown from "@/components/tools/search-song/search-dropdown";
// import { toOptions } from "@/lib/general";
// import { getAllKeysDrive, deleteAllSong } from "@/lib/storage/drive";
// import { getSongByKey } from "@/lib/storage/song";
// import { extractFile } from "@/lib/zip";
// import useTracklistStore from "@/features/tracklist/tracklist-store";
// import React, { useEffect, useState } from "react";
// import { FaDownload } from "react-icons/fa";
// import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
// import FileDatabaseList from "../../common-datastores/file-database-list";
// import SelectedFileDatabaseList from "../../common-datastores/selected-file-database-list";

// interface ExtremeMusicProps {
//   limit?: number;
// }

// const ExtremeMusic: React.FC<ExtremeMusicProps> = ({ limit = 20 }) => {
//   const searchTracklist = useTracklistStore((state) => state.searchTracklist);

//   const [songs, setSongs] = useState<ListItem<File>[]>([]);
//   const [songFucos, setSongFucos] = useState<string>();

//   const [folderFocus, setFolderFocus] = useState<string>();
//   const [unzipLoading, setUnzipLoading] = useState<boolean>(false);

//   const onClickFolder = async (files: File[]) => {
//     setSongs(files.map((data) => ({ row: data.name, value: data })));
//     setUnzipLoading(false);
//     setSongFucos(undefined);
//   };
//   async function onSearch<T = any>(value: string) {
//     const se = (await searchTracklist(value)) ?? [];
//     const op = toOptions<SearchResult>({
//       render: (value) => <SearchDropdown value={value}></SearchDropdown>,
//       list: se,
//     });
//     return op as T;
//   }

//   return (
//     <>
//       {/* {optionSearch && (
//           <div className="col-span-2 md:col-span-1">
//             <div className="w-full">
//               <Label>ค้นหา</Label>
//               <div className="p-2 border text-sm leading-7">
//                 <Label>เพลง :</Label> {optionSearch?.name}
//                 <br />
//                 <Label>นักร้อง :</Label> {optionSearch?.artist} <br />
//                 <Label>ตำแหน่ง :</Label> {optionSearch?.fileId} <br />
//                 <Label>ไฟล์ ID :</Label>{" "}
//                 <span className="uppercase">{optionSearch?.id}</span> <br />
//                 <Label>ประเภท :</Label>{" "}
//                 <span className="uppercase">
//                   {optionSearch?.type === 0 ? "emk" : "ncn"}
//                 </span>{" "}
//                 <br />
//               </div>
//             </div>
//           </div>
//         )} */}
//       <div className="w-full h-full flex flex-col md:flex-row  gap-2 ">
//         <div className="w-full h-full flex flex-col items-end border rounded-md border-blue-500">
//           <FileDatabaseList
//             limit={10}
//             getKeysDatabase={getAllKeysDrive}
//             getFileByKey={getSongByKey}
//             extracted={onClickFolder}
//           ></FileDatabaseList>
//         </div>
//         <div className="w-full h-full flex flex-col items-end border rounded-md border-blue-500">
//           <SelectedFileDatabaseList
//             filelist={songs}
//             label={`ไฟล์เพลง ${folderFocus ?? ""}`}
//             loading={unzipLoading}
//           ></SelectedFileDatabaseList>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ExtremeMusic;
