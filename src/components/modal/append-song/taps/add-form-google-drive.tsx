// import Button from "@/components/common/button/button";
// import Input from "@/components/common/input-data/input";
// import Label from "@/components/common/label";
// import Modal from "@/components/common/modal";
// import { useAppControl } from "@/hooks/app-control-hook";
// import { testUrl } from "@/lib/fetch/test-api";
// import {
//   setLocalDriveUrl,
//   setLocalDriveTested,
//   getLocalDriveUrl,
//   getLocalDriveTested,
// } from "@/lib/local-storage";

// import React, { useEffect, useState } from "react";
// import AddFromDrive from "./add-from-drive";

// interface AddFormGoogleDriveProps {
//   onAddTrackListDrvie: (value: string) => Promise<void>;
//   onAddUrlDrvie?: (value: string) => void;
// }

// const AddFormGoogleDrive: React.FC<AddFormGoogleDriveProps> = ({
//   // onAddFileTracklist,
//   onAddUrlDrvie,
// }) => {
//   const { setSystemDriveMode } = useAppControl();
//   const [value, setValue] = useState<string>();
//   const [valueFIle, setValueFile] = useState<string>();
//   const [loading, setLoading] = useState<boolean>(false);
//   const [checked, setChecked] = useState<boolean>(false);
//   const [error, setError] = useState<string>();
//   const [fetchfile, setFetchFile] = useState<boolean>(false);

//   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const value = event.target.value;
//     setValue(value);
//   };

//   const hanndleOnSave = () => {
//     if (value) {
//       // fetchTest();
//       setLocalDriveUrl(value);
//     }
//   };

//   const handleChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const value = event.target.value;
//     setValueFile(value);
//   };

//   // const hanndleOnSaveFile = () => {
//   //   if (valueFIle) {
//   //     fetchTrckListFile();
//   //   }
//   // };

//   function QueryPost(params: any): FormData {
//     const formData = new FormData();
//     Object.keys(params).map((key) => {
//       if (params[key] !== undefined) {
//         if (Array.isArray(params[key])) {
//           formData.append(key, JSON.stringify(params[key]));
//         } else {
//           formData.append(key, params[key]);
//         }
//       }
//     });

//     return formData;
//   }

//   const handleGetFile = async () => {
//     setLoading(true);
//     try {
//       if (!value) {
//         setLoading(false);
//         setError("ไม่มี Google Url");
//         throw "ไม่มี Google Url";
//       }
//       const res = await testUrl(value);
//       setLoading(false);
//       return res;
//     } catch (error) {
//       setError("Error uploading file: " + JSON.stringify(error));
//       setLoading(false);
//       return {};
//     }
//   };

//   // const fetchTest = async () => {
//   //   setChecked(false);

//   //   const res = await handleGetFile();
//   //   if (res.test === "TEST") {
//   //     setChecked(true);
//   //     setError(undefined);
//   //     setLocalDriveTested(true);
//   //     setSystemDriveMode(true);
//   //   } else {
//   //     setLocalDriveTested(false);
//   //     setSystemDriveMode(false);
//   //   }
//   // };

//   // const fetchTrckListFile = async () => {
//   //   setFetchFile(true);
//   //   const response = await fetch(valueFIle!);
//   //   const fileBlob = await response.blob();
//   //   const file = new File([fileBlob], "song.json", { type: fileBlob.type });
//   //   onAddFileTracklist(file);
//   // };

//   useEffect(() => {
//     const isSaved = getLocalDriveUrl();
//     const isTested = getLocalDriveTested();
//     if (isSaved) {
//       setValue(isSaved);
//     }
//     if (isTested === "true") {
//       setChecked(true);
//       setSystemDriveMode(true);
//     } else {
//       setChecked(false);
//       setSystemDriveMode(false);
//     }
//   }, []);

//   return (
//     <>
//       {/* <Modal
//         title="กำลังประมวลผล"
//         closable={false}
//         removeFooter={false}
//         width="400px"
//         height="130px"
//         isOpen={fetchfile}
//       >
//         e
//       </Modal> */}
//       {/* <Label>Google Apps Script URL</Label>
//       <div className="flex gap-1 w-full pb-1">
//         <Input
//           className="w-full !text-black"
//           value={value}
//           onChange={handleChange}
//         ></Input>
//         <Button
//           blur={false}
//           color="blue"
//           className="text-white"
//           disabled={loading}
//           onClick={hanndleOnSave}
//         >
//           บันทึก
//         </Button>
//       </div> */}

//       {/* <AddFromDrive onAddUrlDrvie={onAddUrlDrvie} ></AddFromDrive> */}
//       {/* <div className="flex gap-1 items-center">
//         {loading ? (
//           <>
//             <div className="w-4 h-4 bg-gray-400 rounded-full overflow-hidden flex items-center justify-center">
//               <AiOutlineLoading className="text-white text-[10px] animate-spin"></AiOutlineLoading>
//             </div>
//             <Label>กำลังทดสอบ</Label>
//           </>
//         ) : (
//           <>
//             {error !== undefined ? (
//               <>
//                 <div className="w-4 h-4 bg-red-500 rounded-full overflow-hidden flex items-center justify-center">
//                   <RiErrorWarningLine className="text-white text-[10px]"></RiErrorWarningLine>
//                 </div>
//                 <Label>{error}</Label>
//               </>
//             ) : checked === true ? (
//               <>
//                 <div className="w-4 h-4 bg-green-500 rounded-full overflow-hidden flex items-center justify-center">
//                   <FaCheck className="text-white text-[10px]"></FaCheck>
//                 </div>
//                 <Label>เชื่อมต่อแล้ว</Label>
//               </>
//             ) : (
//               <>
//                 <div className="w-4 h-4 bg-red-500 rounded-full overflow-hidden flex items-center justify-center">
//                   <RiErrorWarningLine className="text-white text-[10px]"></RiErrorWarningLine>
//                 </div>
//                 <Label>URL ไม่ถูกต้อง</Label>
//               </>
//             )}
//           </>
//         )}
//       </div>

//       <div onClick={fetchTrckListFile}>test</div>

//       <div className="pt-4">
//         <Label>Tracklist URL</Label>
//         <div className="flex gap-1 w-full pb-1">
//           <Input
//             className="w-full !text-black"
//             value={value}
//             onChange={handleChangeFile}
//           ></Input>
//           <Button
//             blur={false}
//             color="blue"
//             className="text-white"
//             disabled={loading}
//             onClick={hanndleOnSaveFile}
//           >
//             บันทึก
//           </Button>
//         </div>
//       </div> */}
//     </>
//   );
// };

// export default AddFormGoogleDrive;
