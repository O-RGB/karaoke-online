// import React, { useState, useCallback } from 'react';
// import * as zlib from 'zlib';

// interface EMKCreatorProps {}

// const EMKCreator: React.FC<EMKCreatorProps> = () => {
//   const [midFile, setMidFile] = useState<File | null>(null);
//   const [lyrFile, setLyrFile] = useState<File | null>(null);
//   const [curFile, setCurFile] = useState<File | null>(null);

//   const handleFileChange = useCallback((setter: (file: File | null) => void) => (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0] || null;
//     setter(file);
//   }, []);

//   const createEMKFile = useCallback(async () => {
//     if (!midFile || !lyrFile || !curFile) {
//       alert('Please upload all required files');
//       return;
//     }

//     const xorKey = new Uint8Array([0xaf, 0xf2, 0x4c, 0x9c, 0xe9, 0xea, 0x99, 0x43]);
//     const magic = new Uint8Array([0x2e, 0x53, 0x46, 0x44, 0x53]);

//     const createFileData = async (file: File, tag: string): Promise<Uint8Array> => {
//       const arrayBuffer = await file.arrayBuffer();
//       const rawData = new Uint8Array(arrayBuffer);
//       const compressedData = zlib.deflateSync(Buffer.from(rawData));
      
//       const header = new Uint8Array(64);
//       const dataView = new DataView(header.buffer);
      
//       // Write SFDS magic
//       header.set([0x53, 0x46, 0x44, 0x53], 0);
      
//       // Write tag
//       const encoder = new TextEncoder();
//       header.set(encoder.encode(tag), 4);
      
//       // Write uncompressed size
//       dataView.setUint32(16, rawData.length, true);
      
//       // Write compressed size
//       dataView.setUint32(24, compressedData.length, true);
      
//       // Combine header and compressedData without using spread operator
//       const result = new Uint8Array(header.length + compressedData.length);
//       result.set(header, 0);
//       result.set(compressedData, header.length);
      
//       return result;
//     };

//     const midData = await createFileData(midFile, 'MIDI_DATA');
//     const lyrData = await createFileData(lyrFile, 'LYRIC_DATA');
//     const curData = await createFileData(curFile, 'CURSOR_DATA');

//     const totalSize = magic.length + midData.length + lyrData.length + curData.length;
//     const emkData = new Uint8Array(totalSize);

//     let offset = 0;
//     emkData.set(magic, offset);
//     offset += magic.length;
//     emkData.set(midData, offset);
//     offset += midData.length;
//     emkData.set(lyrData, offset);
//     offset += lyrData.length;
//     emkData.set(curData, offset);

//     // XOR encrypt
//     for (let i = 0; i < emkData.length; i++) {
//       emkData[i] ^= xorKey[i % xorKey.length];
//     }

//     const blob = new Blob([emkData], { type: 'application/octet-stream' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'output.emk';
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   }, [midFile, lyrFile, curFile]);

//   return (
//     <div>
//       <h1>EMK File Creator</h1>
//       <div>
//         <label>
//           MIDI File:
//           <input type="file" accept=".mid" onChange={handleFileChange(setMidFile)} />
//         </label>
//       </div>
//       <div>
//         <label>
//           Lyric File:
//           <input type="file" accept=".lyr" onChange={handleFileChange(setLyrFile)} />
//         </label>
//       </div>
//       <div>
//         <label>
//           Cursor File:
//           <input type="file" accept=".cur" onChange={handleFileChange(setCurFile)} />
//         </label>
//       </div>
//       <button onClick={createEMKFile}>Create EMK File</button>
//     </div>
//   );
// };

// export default EMKCreator;