import { EMK_FILE_TYPE } from "@/config/value";
import { parseEMKFile } from "./emk";
import { readCursorFile, readLyricsFile, validateSongFileTypes } from "./ncn";

export const onSelectTestMusic = async (
  _: File | undefined,
  FileList: FileList
) => {
  if (FileList.length === 1) {
    const file = FileList.item(0);
    if (!file?.name.endsWith(EMK_FILE_TYPE)) {
      return;
    }
    const decode = await parseEMKFile(file);
    if (decode.cur && decode.lyr && decode.mid) {
      var song: SongFilesDecode = {
        mid: decode.mid,
        cur: (await readCursorFile(decode.cur)) ?? [],
        lyr: await readLyricsFile(decode.lyr),
      };
      return song;
    }
  } else if (FileList.length === 3) {
    const valid = validateSongFileTypes(FileList);
    if (!valid) {
      return;
    }
    var song: SongFilesDecode = {
      mid: valid.mid,
      cur: (await readCursorFile(valid.cur)) ?? [],
      lyr: await readLyricsFile(valid.lyr),
    };
    return song;
  }
};
