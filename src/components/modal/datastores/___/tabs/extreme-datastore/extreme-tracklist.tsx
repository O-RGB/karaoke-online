// import Label from "@/components/common/display/label";
// import TableList from "@/components/common/table/table-list";
// import SearchDropdown from "@/components/tools/search-song/search-dropdown";
// import React, { useEffect, useState } from "react";
// import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

// interface ExtremeTracklistProps {
//   limit?: number;
//   getTracklistTest(
//     tracklistStores?: TracklistFrom[],
//     limit?: number,
//     offset?: number
//   ): Promise<{
//     results: SearchResult[];
//     totalCount: number;
//     hasMore: boolean;
//   }>;
// }

// const ExtremeTracklist: React.FC<ExtremeTracklistProps> = ({
//   limit = 20,
//   getTracklistTest,
// }) => {
//   const [zipFilename, setZipFilename] = useState<ListItem<SearchResult>[]>([]);

//   const [folderFocus, setFolderFocus] = useState<string>();
//   const [page, setPage] = useState<number>(0);

//   const load = async (offset: number = 0) => {
//     const res = await getTracklistTest(["EXTHEME"], limit, offset);
//     setZipFilename(
//       res.results.map(
//         (data) =>
//           ({
//             row: <SearchDropdown value={data}></SearchDropdown>,
//             value: data,
//           } as ListItem<SearchResult>)
//       )
//     );
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   return (
//     <>
//       <div className="w-full h-full flex flex-col items-end border rounded-md border-blue-500">
//         <div className="flex items-center w-full bg-gray-200 p-2 rounded-t-md justify-between">
//           <Label className="text-gray-700 font-bold">รายชื่อเพลง</Label>
//           <div className="flex items-center justify-center gap-2 text-xs">
//             <IoIosArrowBack
//               className="cursor-pointer"
//               onClick={() => {
//                 setPage((value) => {
//                   if (value - 1 <= 0) {
//                     return 0;
//                   } else {
//                     return value - 1;
//                   }
//                 });
//                 load((page - 1) * limit);
//               }}
//             ></IoIosArrowBack>
//             <span className="min-w-5 text-center"> {page + 1}</span>
//             <IoIosArrowForward
//               className="cursor-pointer"
//               onClick={() => {
//                 setPage((value) => value + 1);
//                 load((page + 1) * limit);
//               }}
//             ></IoIosArrowForward>
//           </div>
//         </div>
//         <TableList
//           className="!rounded-b-md !border-none h-[155px] md:h-[350px]"
//           height={""}
//           deleteItem={false}
//           scrollToItem={folderFocus}
//           listKey="folder-list"
//           label="รายชื่อโฟลเดอร์"
//           list={zipFilename}
//         ></TableList>
//       </div>
//     </>
//   );
// };

// export default ExtremeTracklist;
