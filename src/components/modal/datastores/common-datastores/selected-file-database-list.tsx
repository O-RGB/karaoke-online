// import Button from "@/components/common/button/button";
// import Label from "@/components/common/display/label";
// import TableList from "@/components/common/table/table-list";
// import React, { useEffect } from "react";
// import { FaDownload } from "react-icons/fa";

// interface SelectedFileDatabaseListProps {
//   filelist: ListItem<File>[];
//   label: string;
//   loading?: boolean;
// }

// const SelectedFileDatabaseList: React.FC<SelectedFileDatabaseListProps> = ({
//   filelist,
//   label,
//   loading,
// }) => {
//   useEffect(() => {}, [filelist]);
//   return (
//     <>
//       <div className="flex items-center w-full bg-gray-200 p-2 rounded-t-md justify-between">
//         <Label className="text-gray-700 font-bold">{label}</Label>
//       </div>
//       <TableList
//         className="!rounded-b-md !border-none h-[155px] md:h-[350px]"
//         height={""}
//         deleteItem={false}
//         itemAction={(file: File, index: number) => {
//           return (
//             <Button
//               shadow={false}
//               border={""}
//               onClick={() => {
//                 const url = URL.createObjectURL(file);
//                 const link = document.createElement("a");
//                 link.href = url;
//                 link.download = file.name;
//                 document.body.appendChild(link);
//                 link.click();
//                 document.body.removeChild(link);
//                 URL.revokeObjectURL(url);
//               }}
//               padding=""
//               className="w-7 h-7"
//               color="blue"
//               blur={false}
//               icon={<FaDownload className="text-white"></FaDownload>}
//             ></Button>
//           );
//         }}
//         hoverFocus={false}
//         listKey="songs-list"
//         renderKey="name"
//         label={label}
//         list={filelist}
//         loading={loading}
//       ></TableList>
//     </>
//   );
// };

// export default SelectedFileDatabaseList;
