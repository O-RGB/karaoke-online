import { Sequencer } from "spessasynth_lib";
import { getMidiInfo } from "../mixer";

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

export const convertCursorToTicks = (
  ticksPerBeat: number,
  cursor: number[]
) => {
  // const midInfo = getMidiInfo(player);
  // if (midInfo?.ticksPerBeat === 0) {
  //   console.error(midInfo)
  //   return [];
  // }
  let curOnTick = cursor.map((data) => data * ((ticksPerBeat ?? 1) / 24));
  return curOnTick;
};

export const mapCursorToIndices = (cursorPositions: number[]) => {
  const cursorMap = new Map<number, number[]>();

  cursorPositions.forEach((tick, charIndex) => {
    const indices = cursorMap.get(tick) || [];
    indices.push(charIndex);
    cursorMap.set(tick, indices);
  });

  return cursorMap;
};
