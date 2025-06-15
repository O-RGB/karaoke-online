import {
  CUR_FILE_TYPE,
  EMK_FILE_TYPE,
  LYR_FILE_TYPE,
  MID_FILE_TYPE,
} from "@/config/value";
import { parseEMKFile } from "./emk";
import { readCursorFile, readLyricsFile } from "./ncn";
import { KaraokeDecoded } from "@/features/songs/types/songs.type";

export const loadKaraokeTracks = async (
  file: FileList
): Promise<KaraokeDecoded[]> => {
  const song: KaraokeDecoded[] = [];
  const groups = groupFileTrackList(file);

  await Promise.all(
    Object.values(groups).map(async (group) => {
      if (group.emk) {
        let lyr: string[] = [];

        try {
          const decode = await parseEMKFile(group.emk);

          if (decode.lyr) {
            lyr = await readLyricsFile(decode.lyr);
          }

          if (decode.mid && decode.cur && decode.lyr) {
            const cur = await readCursorFile(decode.cur);
            song.push({
              midi: decode.mid,
              cur: cur ?? [],
              lyr: lyr,
              emk: group.emk,
              fileName: group.emk.name.replace(".emk", "")
            });
            return;
          }
        } catch {
          song.push({
            midi: new File([], group.emk.name),
            cur: [],
            lyr: lyr,
            error: true,
            fileName: group.emk.name.replace(".emk", ""),
          });
          return;
        }
      }

      if (group.mid && group.cur && group.lyr) {
        const cur = await readCursorFile(group.cur);
        const lyr = await readLyricsFile(group.lyr);

        song.push({
          midi: group.mid,
          cur: cur ?? [],
          lyr: lyr,
          fileName: group.mid.name.replace(".mid", ""),
        });
      }
    })
  );

  return song;
};

const groupFileTrackList = (fileList: FileList): FileGroup[] => {
  const groups: FileGroup[] = [];
  const fileMap: Record<string, FileGroup> = {};

  Array.from(fileList).forEach((file) => {
    const [name, ext] = file.name.toLowerCase().split(/\.(?=[^.]+$)/);
    if (ext === EMK_FILE_TYPE) {
      groups.push({ emk: file });
    } else {
      const group = (fileMap[name] ||= {});
      if (ext === MID_FILE_TYPE) group.mid = file;
      else if (ext === LYR_FILE_TYPE) group.lyr = file;
      else if (ext === CUR_FILE_TYPE) group.cur = file;
    }
  });

  return groups.concat(Object.values(fileMap));
};
