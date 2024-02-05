import { Base64ToBlob } from "../utils/song.utils";
import FetchApi from "./utils/fetchApi";

export const GetSongByPath = async (url: string, input: MiniApiNCNInput) => {
  return await FetchApi<MiniApiNCN>(url, "POST", input).then(async (data) => {
    let curToFile: File = Base64ToBlob(data.cur, "cur", input.filename);
    let lyrToFile: File = Base64ToBlob(data.lyr, "lyr", input.filename);
    let midToFile: File = Base64ToBlob(data.mid, "mid", input.filename);

    let copy: MiniApiNCN = {
      cur: curToFile,
      lyr: lyrToFile,
      mid: midToFile,
      path: data.path,
    };
    return copy;
  });
};

export const GetSongList = async (url: string) => {
  return await FetchApi<IGetSongListApi>(url, "GET").then((data) => {
    return data;
  });
};
