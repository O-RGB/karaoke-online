import { PropsWithChildren, useEffect, useState } from "react";
import { LoadFileContext } from "./test-load-file-context";
import TrieSearch from "trie-search";
import JSZip from "jszip";
import { GetSongByPath, GetSongList } from "../../api/get_song_list";
import useConfig from "../../hooks/useConfig";

const SongListFileName = "song_list.json";

export const LoadFileProvider = ({ children }: PropsWithChildren) => {
  const [Folder, setFolder] = useState<Folder | undefined>(undefined);
  const [ZipFile, setZipFile] = useState<File | undefined>(undefined);
  const [ZipFileLoad, setZipFileLoad] = useState<JSZip | undefined>(undefined);
  const [SongList, setSongList] = useState<SearchNCN[] | undefined>(undefined);
  const [songListLoading, setSongListLoad] = useState<boolean>(false);
  const [Trie, setTrie] = useState<TrieSearch<SearchNCN> | undefined>(
    undefined
  );
  const config = useConfig();
  const [loadType, setLoadType] = useState<LoadType | undefined>(undefined);
  const [songLoading, setSongLoad] = useState<boolean>(false);

  function songListFileToJson(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const contentArrayBuffer = e.target.result;
        let parsedJSON = JSON.parse(contentArrayBuffer) as SearchNCN[];
        setSongList(parsedJSON);
        const trie = new TrieSearch<SearchNCN>(["name", "artist"]);
        trie.addAll(parsedJSON);
        setTrie(trie);
      } catch (error) {}
    };
    reader.readAsText(file as File);
  }

  function songListApiToJson(json: SearchNCN[]) {
    setSongList(json);
    const trie = new TrieSearch<SearchNCN>(["name", "artist"]);
    trie.addAll(json);
    setTrie(trie);
  }

  function getSongList(Folder: Folder) {
    let mainKey = Object.keys(Folder);
    if (mainKey.length == 1) {
      let song_list: File = Folder[mainKey[0]][SongListFileName] as File;
      if (song_list) {
        songListFileToJson(song_list);
      }
    }
  }

  const getSongListFromZip = async (zipFile: File, ZipFileLoad: JSZip) => {
    if (ZipFileLoad) {
      let path = `${zipFile.name.replace(".zip", "")}/${SongListFileName}`;
      let selectedFile = ZipFileLoad.file(path);
      const blob = await selectedFile?.async("blob");
      if (blob) {
        const file = new File([blob], SongListFileName.replace(".zip", ""), {
          type: "application/octet-stream",
        });
        songListFileToJson(file);
      }
    }
  };

  async function getValueFromPath(path: string[], data: Folder) {
    let current: any = data;
    for (const key of path) {
      if (current.hasOwnProperty(key)) {
        current = current[key] as Folder;
      } else {
        return undefined;
      }
    }
    return current as File;
  }

  const extractZipByPath = async (pathParam: string[]) => {
    if (ZipFileLoad) {
      let path = pathParam.join("/");
      let selectedFile = ZipFileLoad.file(path);
      const blob = await selectedFile?.async("blob");
      console.log("blob Reautl ", blob);
      if (blob) {
        const file = new File([blob], pathParam[pathParam.length - 1], {
          type: "application/octet-stream",
        });
        return file;
      }
      return undefined;
    } else {
      return undefined;
    }
  };

  const loadFileInApi = async (input: MiniApiNCNInput) => {
    const data = await GetSongByPath(`${config.ApiServer}/files`, input);
    return data;
  };

  const loadSongListInApi = (input?: string) => {
    console.log(`${input ? input : config.ApiServer}/lists`);
    setSongListLoad(true);
    GetSongList(`${input ? input : config.ApiServer}/lists`).then((data) => {
      if (data) {
        console.log(data.data[0].name);
        setSongListLoad(false);
        songListApiToJson(data.data);
      }
    });
  };

  const readNCNByPath = async (
    filename: string,
    path: string[],
    type: "NCN" | "EMK"
  ) => {
    console.log(type)
    if (!loadType) return undefined;

    setSongLoad(true);

    let firstPath = path[0];
    let getSearch = path.map((v) => v);
    getSearch = getSearch.splice(1, getSearch.length);
    let mainCur = "Cursor";
    let mainLyr = "Lyrics";
    let mainMid = "Song";
    let cur: File | undefined = undefined;
    let lyr: File | undefined = undefined;
    let mid: File | undefined = undefined;

    if (loadType == "FOLDER" && Folder) {
      return Promise.all([
        getValueFromPath(
          [firstPath, mainCur, ...getSearch, filename + ".cur"],
          Folder
        ),
        getValueFromPath(
          [firstPath, mainLyr, ...getSearch, filename + ".lyr"],
          Folder
        ),
        getValueFromPath(
          [firstPath, mainMid, ...getSearch, filename + ".mid"],
          Folder
        ),
      ]).then((ncn) => {
        cur = ncn[0];
        lyr = ncn[1];
        mid = ncn[2];
        return { cur, lyr, mid };
      });
    } else if (loadType == "ZIP") {
      let firstPath = path[0];
      return Promise.all([
        extractZipByPath([firstPath, mainCur, ...getSearch, filename + ".cur"]),
        extractZipByPath([firstPath, mainLyr, ...getSearch, filename + ".lyr"]),
        extractZipByPath([firstPath, mainMid, ...getSearch, filename + ".mid"]),
      ])
        .then((ncn) => {
          cur = ncn[0];
          lyr = ncn[1];
          mid = ncn[2];
          return { cur, lyr, mid };
        })
        .finally(() => setSongLoad(false));
    } else if (loadType == "API") {
      const file = await loadFileInApi({
        filename: filename,
        path: firstPath,
        path_category: path[path.length - 1],
        type: type,
      });
      setSongLoad(false);
      return {
        cur: file.cur,
        lyr: file.lyr,
        mid: file.mid,
      };
    } else {
      return {
        cur,
        lyr,
        mid,
      };
    }
  };

  const setApiProgram = (input?: string) => {
    setLoadType("API");
    loadSongListInApi(input);
  };
  const setZipProgram = async (zip: File) => {
    setLoadType("ZIP");
    JSZip.loadAsync(zip).then((data) => {
      setZipFileLoad(data);
      getSongListFromZip(zip, data);
    });
  };
  const setFolderProgram = (Folder: Folder) => {
    setLoadType("FOLDER");
    getSongList(Folder);
    setFolder(Folder);
  };

  useEffect(() => {}, [Folder, config.ApiServer]);

  return (
    <LoadFileContext.Provider
      value={{
        Folder,
        SongList,
        Trie,
        setFolderProgram,
        readNCNByPath,
        extractZipByPath,
        setZipFile,
        ZipFile,
        setZipProgram,
        loadSongListInApi,
        loadFileInApi,
        setApiProgram,
        songLoading,
        songListLoading,
        // extractZipToSongList,
      }}
    >
      {children}
    </LoadFileContext.Provider>
  );
};
