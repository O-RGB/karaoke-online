import { MID_FILE_TYPE, CUR_FILE_TYPE, LYR_FILE_TYPE } from "@/config/value";

export const readLyricsFile = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const decoder = new TextDecoder("windows-874");
  const contentUtf8 = decoder.decode(arrayBuffer);
  var lines = contentUtf8.split("\r\n"); // หรือ '\r\n' ตามที่เหมาะสม
  lines = lines.map((data) => data.trim());
  return lines;
};
export const readCursorFile = async (file: File) => {
  try {
    const data = await file.arrayBuffer();
    const cursorData: number[] = [];
    const view = new DataView(data);

    let offset = 0;
    while (offset < view.byteLength) {
      const tmpByte1 = view.getUint8(offset);
      if (offset + 1 < view.byteLength) {
        const tmpByte2 = view.getUint8(offset + 1);
        if (tmpByte2 === 0xff) {
          break;
        }
        const value = tmpByte1 + tmpByte2 * 256;
        cursorData.push(value);
        offset += 2;
      } else {
        cursorData.push(tmpByte1);
        offset += 1;
      }
    }
    return cursorData;
  } catch (error) {
    console.error("Error loading cursor:", error);
  }
};

export const validateSongFileTypes = (
  FileList: FileList
): SongFiles | undefined => {
  if (FileList.length !== 3) {
    return undefined;
  }

  const anyType1: File | null = FileList.item(0);
  const anyType2: File | null = FileList.item(1);
  const anyType3: File | null = FileList.item(2);

  if (anyType1 && anyType2 && anyType3) {
    const filelist = [anyType1, anyType2, anyType3];
    const song: Partial<SongFiles> = {};
    filelist.map((data) => {
      const name = data.name;
      if (name.endsWith(MID_FILE_TYPE)) {
        song.mid = data;
      } else if (name.endsWith(CUR_FILE_TYPE)) {
        song.cur = data;
      } else if (name.endsWith(LYR_FILE_TYPE)) {
        song.lyr = data;
      }
    });

    if (song.cur && song.lyr && song.mid) {
      return song as SongFiles;
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
};
