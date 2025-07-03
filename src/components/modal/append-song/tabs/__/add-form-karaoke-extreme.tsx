// import Button from "@/components/common/button/button";
// import Upload from "@/components/common/input-data/upload";
// import Label from "@/components/common/display/label";
// import Link from "next/link";
// import React from "react";
// import { BsYoutube } from "react-icons/bs";
// import { FaDownload, FaWindows } from "react-icons/fa";
// import { GrDocumentZip } from "react-icons/gr";
// import { SiMacos } from "react-icons/si";
// import { TbJson } from "react-icons/tb";

// interface AddFormKaraokeExtremeProps {
//   onCloseProcess?: () => void;
//   onAddFile?: (file: File, filelist: FileList) => void;
//   filename?: string;
//   onAddFileTracklist: (file: File) => void;
//   onRemoveFileTracklist: () => void;
//   filenameTracklist?: string;
//   tracklistCount: number;
//   musicLibraryCount: number;
// }

// const AddFormKaraokeExtreme: React.FC<AddFormKaraokeExtremeProps> = ({
//   onAddFile,
//   onCloseProcess,
//   // process,
//   filename,
//   tracklistCount,
//   musicLibraryCount,
//   onAddFileTracklist,
//   onRemoveFileTracklist,
// }) => {
//   return (
//     <>
//       <div className="flex flex-col h-full">
//         <div className="pb-2">
//           <Label
//             textSize={15}
//             textColor="text-gray-800"
//             headClass="bg-blue-500"
//             description="เลือกไฟล์ .zip และ .json เข้าไปในระบบ"
//           >
//             Import ไฟล์ Extreme
//           </Label>
//         </div>
//         <div className="flex flex-col gap-2">
//           <div className="w-full flex flex-col gap-1">
//             <Label>เลือกไฟล์รวมเพลง (.zip)</Label>
//             <Upload
//               accept=".zip"
//               className="border border-blue-500 p-3 rounded-md hover:bg-gray-50 duration-300 flex justify-between"
//               onSelectFile={onAddFile}
//               inputProps={{}}
//             >
//               <span className="w-full text-sm flex items-center gap-2">
//                 <GrDocumentZip className="text-blue-500"></GrDocumentZip>
//                 <span>อัปโหลดไฟล์ .zip</span>
//               </span>
//               <Label>{filename}</Label>
//             </Upload>
//             <div className="flex gap-1 w-full justify-end pt-1 text-[10px]">
//               <Label>
//                 {" "}
//                 บันทึกแล้ว {musicLibraryCount.toLocaleString()} ไฟล์
//               </Label>
//             </div>
//           </div>
//           <div className="w-full flex flex-col gap-1">
//             <Label>เลือกไฟล์ฐานข้อมูลเพลง (.json) </Label>
//             <Upload
//               accept=".json"
//               className="border border-blue-500 p-3 rounded-md hover:bg-gray-50 duration-300 flex justify-between"
//               onSelectFile={onAddFileTracklist}
//               inputProps={{}}
//             >
//               <span className="w-full text-sm flex items-center gap-2">
//                 <TbJson className="text-blue-500"></TbJson>
//                 <span>อัปโหลดไฟล์ .json</span>
//               </span>
//               {/* <Label>{filenameTracklist}</Label> */}
//             </Upload>
//             <div className="flex gap-1 w-full justify-end pt-1 text-[10px]">
//               <Label>
//                 บันทึกแล้ว {tracklistCount.toLocaleString()} รายชื่อ
//               </Label>
//             </div>
//           </div>
//         </div>
//         <div className="flex flex-col gap-2 py-2">
//           <hr className="pb-2" />
//           <Label
//             textSize={15}
//             textColor="text-gray-800"
//             headClass="bg-blue-500"
//           >
//             ดาวน์โหลดโปรแกรมและวิธีใช้งาน
//           </Label>

//           <span className="flex gap-2">
//             <Link
//               href={
//                 "https://drive.google.com/file/d/1TM9liOAZayz7VJ35jIbLN0z11BlD9mNT/view?usp=sharing"
//               }
//               target="_blank"
//               className="w-fit"
//             >
//               <Button
//                 color="blue"
//                 className="text-white"
//                 shadow=""
//                 border=""
//                 blur=""
//                 icon={<FaWindows></FaWindows>}
//                 iconPosition="left"
//               >
//                 Windows
//               </Button>
//             </Link>
//             <span className="text-sm">
//               <Link
//                 href={"https://www.youtube.com/watch?v=dVPB-dVmG1I"}
//                 target="_blank"
//                 className="w-fit"
//               >
//                 <Button
//                   blur={false}
//                   color="red"
//                   iconPosition="left"
//                   className="text-white w-fit"
//                   icon={<BsYoutube className="text-white" />}
//                 >
//                   วิธีใช้งาน
//                 </Button>
//               </Link>
//             </span>
//           </span>
//         </div>
//       </div>
//     </>
//   );
// };

// export default AddFormKaraokeExtreme;
