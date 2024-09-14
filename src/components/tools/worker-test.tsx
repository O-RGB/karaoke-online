// import React, { useState } from "react";
// import JSZip from "jszip";

// const ZipUploader: React.FC = () => {
//   const [files, setFiles] = useState<{ name: string; url: string }[]>([]);

//   const handleFileChange = async (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     if (event.target.files && event.target.files[0]) {
//       const zipFile = event.target.files[0];
//       const zip = new JSZip();

//       try {
//         // Load the ZIP file
//         await zip.loadAsync(zipFile);

//         const fileList: { name: string; url: string }[] = [];

//         // Process files inside the ZIP
//         zip.forEach(async (relativePath, zipEntry) => {
//           if (!zipEntry.dir) {
//             // Read file as Blob
//             const fileContent = await zipEntry.async("blob");
//             const url = URL.createObjectURL(fileContent);

//             fileList.push({ name: relativePath, url });

//             // Update state with new files
//             setFiles([...fileList]);
//           }
//         });
//       } catch (error) {
//         console.error("Error processing zip file:", error);
//       }
//     }
//   };

//   return (
//     <div>
//       <input type="file" onChange={handleFileChange} />
//       <div>
//         {files.map((file, index) => (
//           <div key={index}>
//             <a href={file.url} download={file.name}>
//               {file.name}
//             </a>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ZipUploader;
