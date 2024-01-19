// FileUnpacker.tsx
import { useState } from "react";

const FileUnpacker: React.FC = () => {
  const [fileContent, setFileContent] = useState<string | null>(null);

  // Function to compare arrays
  const arraysEqual = (a: Uint8Array, b: Uint8Array) => {
    return (
      a.length === b.length && a.every((value, index) => value === b[index])
    );
  };

  const readBigUInt64LE = (buffer: Uint8Array, offset: number) => {
    const view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength
    );
    const low = view.getUint32(offset, true);
    const high = view.getUint32(offset + 4, true);
    return BigInt(low) + (BigInt(high) << BigInt(32));
  };

  // Function to read UInt16LE from Uint8Array
  const readUInt16LE = (array: Uint8Array, offset: number): number => {
    return array[offset] | (array[offset + 1] << 8);
  };

  // Function to read UInt32LE from Uint8Array
  const readUInt32LE = (array: Uint8Array, offset: number): number => {
    return (
      array[offset] |
      (array[offset + 1] << 8) |
      (array[offset + 2] << 16) |
      (array[offset + 3] << 24)
    );
  };

  // Function to convert Uint8Array to hexadecimal string
  const uint8ArrayToHex = (uint8Array: Uint8Array): string => {
    return Array.prototype.map
      .call(uint8Array, (x: number) => ("00" + x.toString(16)).slice(-2))
      .join("");
  };

  const unpackFile = (data: Uint8Array) => {
    // Simulate XOR decryption
    const xorKey = new Uint8Array([
      0xaf, 0xf2, 0x4c, 0x9c, 0xe9, 0xea, 0x99, 0x43,
    ]);
    for (let i = 0; i < data.length; i++) {
      data[i] ^= xorKey[i % xorKey.length];
    }

    // Magic number check
    const magic = new Uint8Array([0x2e, 0x53, 0x46, 0x44, 0x53]); // ".SFDS"
    if (!arraysEqual(data.slice(0, magic.length), magic)) {
      console.error("Invalid magic");
      return;
    }

    // Header information
    const headerPos = readBigUInt64LE(data, 0x22);
    const headerEnd = readBigUInt64LE(data, 0x2a);
    const header = data.slice(Number(headerPos), Number(headerEnd));

    let off = 0;
    const skipBytes = (n: number) => (off += n);

    const readByte = () => header[off++];
    const readUShort = () => {
      const v = readUInt16LE(header, off);
      off += 2;
      return v;
    };
    const readUInt = () => {
      const v = readUInt32LE(header, off);
      off += 4;
      return v;
    };
    const readString = () => {
      const len = readByte();
      const decoder = new TextDecoder("utf-8");
      const str = decoder.decode(header.slice(off, off + len));
      off += len;
      return str;
    };
    const checkMagic = (magic: Uint8Array) => {
      const data = header.slice(off, off + magic.length);
      if (!arraysEqual(data, magic)) {
        throw new Error(
          "Invalid magic: " +
            uint8ArrayToHex(data) +
            " != " +
            uint8ArrayToHex(magic)
        );
      }
      off += magic.length;
    };

    // Function to read tags from the header
    const readTag = () => {
      const tag = readByte();
      switch (tag) {
        case 2: {
          const v = readByte();
          console.log("BYTE: " + v);
          return v;
        }
        case 3: {
          const v = readUShort();
          console.log("USHORT: " + v);
          return v;
        }
        case 4: {
          const v = readUInt();
          console.log("UINT: " + v);
          return v;
        }
        case 6: {
          const v = readString();
          console.log("STRING: " + v);
          return v;
        }
        default:
          throw new Error("Unknown tag: 0x" + tag.toString(16));
      }
    };

    // Main unpacking loop
    while (off < header.length) {
      console.log("---------------------------");
      checkMagic(magic);
      const tag = readTag();
      const uncompressedSize = readTag();
      const unk2 = readTag();
      const dataBegin = readTag();
      const dataEnd = readTag();
      const unk5 = readTag();
      const unk6 = readTag();
      skipBytes(0x10);
      const unk7 = readTag();
      const unk8 = readTag();

      // Deflate compressed data
      const compressedData = data.slice(Number(dataBegin), Number(dataEnd));
      const rawData = new TextDecoder().decode(compressedData);

      if (rawData.length !== uncompressedSize) {
        console.error("Invalid uncompressed size");
        return;
      }

      switch (tag) {
        case 0x53464453: // "SFDS"
          console.log("--- HEADER ---");
          console.log(rawData);
          console.log("--- END HEADER ---");
          setFileContent(rawData);
          break;
        // Add cases for other tags as needed
        default:
          break;
      }
    }
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target;
    const file = fileInput.files && fileInput.files[0];

    if (!file) {
      console.error("No file selected");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as ArrayBuffer;
      const data = new Uint8Array(content);
      unpackFile(data);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <input type="file" onChange={handleFile} accept=".emk" />
      <div>
        <strong>Unpacked content:</strong>
        <pre>{fileContent}</pre>
      </div>
    </div>
  );
};

export default FileUnpacker;
