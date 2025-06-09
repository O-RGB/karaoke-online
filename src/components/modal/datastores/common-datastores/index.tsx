// import SwitchRadio from "@/components/common/input-data/switch/switch-radio";
// import React, { useState } from "react";
// import FileDatabaseList from "./file-database-list";
// import SelectedFileDatabaseList from "./selected-file-database-list";
// import TracklistDatabaseList from "./tracklist-database-list";

// interface DatabaseListStoreProps {
//   limit?: number;
//   getKeysDatabase: (limit: number, offset: number) => Promise<IDBValidKey[]>;
//   getFileByKey: (key: string) => Promise<File | undefined>;
//   selectedLabel?: string;
//   label?: string;
//   tracklistStores?: TracklistFrom[];
// }

// const DatabaseList: React.FC<DatabaseListStoreProps> = ({
//   limit = 10,
//   getFileByKey,
//   getKeysDatabase,
//   selectedLabel,
//   label,
//   tracklistStores,
// }) => {
//   const [redioChange, setRadioChange] = useState<string>("FILE");

//   const [fileList, setFileList] = useState<ListItem<File>[]>([]);
//   const [songFucos, setSongFucos] = useState<string>();

//   const [folderFocus, setFolderFocus] = useState<string>();
//   const [unzipLoading, setUnzipLoading] = useState<boolean>(false);

//   const onClickFolder = async (files: File[]) => {
//     setFileList(files.map((data) => ({ row: data.name, value: data })));
//     setUnzipLoading(false);
//     setSongFucos(undefined);
//   };

//   return (
//     <div className="flex flex-col gap-2">
//       <div className="flex justify-between">
//         <SwitchRadio
//           onChange={setRadioChange}
//           options={[
//             {
//               value: "FILE",
//               children: "ไฟล์เพลง",
//             },
//             {
//               value: "TRACKLIST",
//               children: "รายชื่อเพลง",
//             },
//           ]}
//         ></SwitchRadio>
//       </div>

//       {redioChange === "FILE" ? (
//         <>
//           <div className="w-full h-full flex flex-col md:flex-row  gap-2 ">
//             <div className="w-full h-full flex flex-col items-end border rounded-md border-blue-500">
//               <FileDatabaseList
//                 label={label}
//                 limit={limit}
//                 getKeysDatabase={getKeysDatabase}
//                 getFileByKey={getFileByKey}
//                 extracted={onClickFolder}
//               ></FileDatabaseList>
//             </div>
//             <div className="w-full h-full flex flex-col items-end border rounded-md border-blue-500">
//               <SelectedFileDatabaseList
//                 filelist={fileList}
//                 label={selectedLabel ?? ""}
//                 loading={unzipLoading}
//               ></SelectedFileDatabaseList>
//             </div>
//           </div>
//         </>
//       ) : (
//         <TracklistDatabaseList
//           tracklistStores={tracklistStores}
//           limit={limit}
//         ></TracklistDatabaseList>
//       )}
//     </div>
//   );
// };

// export default DatabaseList;
