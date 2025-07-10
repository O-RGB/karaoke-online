// import React, { useEffect, useState } from "react";
// import Label from "../common/display/label";
// import Input from "../common/input-data/input";
// import {
//   getLocalDriveTested,
//   getLocalDriveUrl,
//   setLocalDriveTested,
//   setLocalDriveUrl,
// } from "@/lib/local-storege/local-storage";
// import Button from "../common/button/button";
// import { FaCheck } from "react-icons/fa";
// import { AiOutlineLoading } from "react-icons/ai";
// import { RiErrorWarningLine } from "react-icons/ri";
// import useConfigStore from "@/features/config/config-store";

// interface DriveSettingProps {}

// const DriveSetting: React.FC<DriveSettingProps> = ({}) => {
//   const { setConfig } = useConfigStore();
//   const [value, setValue] = useState<string>();
//   const [loading, setLoading] = useState<boolean>(false);
//   const [checked, setChecked] = useState<boolean>(false);
//   const [error, setError] = useState<string>();

//   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const value = event.target.value;
//     setValue(value);
//   };

//   const hanndleOnSave = () => {
//     if (value) {
//       fetchTest();
//       setLocalDriveUrl(value);
//     }
//   };

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
//     const form = QueryPost({
//       fun: "TEST",
//       test: "TEST",
//     });
//     try {
//       if (!value) {
//         setLoading(false);
//         setError("ไม่มี Google Url");
//         throw "ไม่มี Google Url";
//       }
//       const response = await fetch(value, {
//         method: "POST",
//         body: form,
//       });

//       const result = await response.json();
//       setLoading(false);
//       return result;
//     } catch (error) {
//       setError("Error uploading file: " + JSON.stringify(error));
//       setLoading(false);
//       return {};
//     }
//   };

//   const fetchTest = async () => {
//     setChecked(false);

//     const res = await handleGetFile();
//     if (res.test === "TEST") {
//       setChecked(true);
//       setError(undefined);
//       setLocalDriveTested(true);
//       setConfig({ system: { drive: true } });
//     } else {
//       setLocalDriveTested(false);
//       setConfig({ system: { drive: false } });
//     }
//   };

//   useEffect(() => {
//     const isSaved = getLocalDriveUrl();
//     const isTested = getLocalDriveTested();
//     if (isSaved) {
//       setValue(isSaved);
//     }
//     if (isTested === true) {
//       setChecked(true);
//       setConfig({ system: { drive: true } });
//     } else {
//       setChecked(false);
//       setConfig({ system: { drive: false } });
//     }
//   }, []);
//   return (
//     <>
//       <Label>Google Apps Script URL</Label>
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
//       </div>
//       <div className="flex gap-1 items-center">
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
//     </>
//   );
// };

// export default DriveSetting;
