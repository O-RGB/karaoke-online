import { MID_FILE_TYPE, CUR_FILE_TYPE, LYR_FILE_TYPE } from "@/config/value";
import JSZip from "jszip";
import { readCursorFile, readLyricsFile } from "./karaoke/ncn";
import { getSongBySuperKey } from "./storage";

export const ExtractFile = async (zipFile: File): Promise<File[]> => {
  const zip = new JSZip();
  const fileList: File[] = [];

  await zip.loadAsync(zipFile);
  const entries = Object.values(zip.files);

  for (const zipEntry of entries) {
    if (!zipEntry.dir) {
      const fileContent = await zipEntry.async("blob");
      const file = new File([fileContent], zipEntry.name, {
        type: fileContent.type,
      });
      fileList.push(file);
    }
  }

  return fileList;
};

const getPathSuperZip = (selected?: SearchResult) => {
  let superId = undefined;
  let fileId = undefined;
  if (selected?.fileId) {
    const path = selected.fileId.split("/");
    if (path.length === 2) {
      superId = path[0];
      fileId = path[1];
    }
  }
  return { superId, fileId };
};

export const loadSuperZipAndExtractSong = async (
  songStore: Map<string, File>,
  selected?: SearchResult
) => {
  const { superId, fileId } = getPathSuperZip(selected);
  if (superId && fileId) {
    var superFile: File | undefined = undefined;
    if (songStore.size === 0) {
      superFile = await getSongBySuperKey(`${superId}.zip`);
    } else {
      superFile = songStore.get(superId);
    }
    if (superFile) {
      const superUnzip = await ExtractFile(superFile);
      const index = parseInt(fileId);
      if (!Number(index)) {
        return;
      }
      const zip = superUnzip[index];
      const songUnzip = await ExtractFile(zip);

      var song: Partial<SongFilesDecode> = {};
      songUnzip.map(async (file) => {
        if (file.name.endsWith(MID_FILE_TYPE)) {
          song.mid = file;
        } else if (file.name.endsWith(CUR_FILE_TYPE)) {
          song.cur = await readCursorFile(file);
        } else if (file.name.endsWith(LYR_FILE_TYPE)) {
          song.lyr = await readLyricsFile(file);
        }
      });

      return song as SongFilesDecode;
    }
  }
};
