"use client";

import { createContext, FC, useEffect, useRef, useState } from "react";
import { useSynth } from "../hooks/spessasynth-hooks";
import { useRemote } from "../hooks/peer-hooks";
import { volumeChange } from "@/lib/mixer";
import TrieSearch from "trie-search";
import { addSongList, onSearchList } from "@/lib/trie-search";
import { FileWithDirectoryAndFileHandle } from "browser-fs-access";

type MixerContextType = {
  updateVolume: (index: number, value: number) => void;
  onSearchStrList: (str: string) => Promise<SearchResult[]> | undefined;
  setSongListFile: (file: File) => Promise<void>;
  setSongEventHandle: (value: SearchResult) => void;
  setSongStoreHandle: (
    files: Map<string, FileWithDirectoryAndFileHandle>
  ) => void;
  setLyricsHandle: (lyr: string[]) => void;
  lyrics: string[];
  songStore: Map<string, FileWithDirectoryAndFileHandle>;
  songList: TrieSearch<SearchResult> | undefined;
  songEvent: SearchResult | undefined;
  volumeController: number[];
};

type MixerProviderProps = {
  children: React.ReactNode;
};

export const MixerContext = createContext<MixerContextType>({
  updateVolume: () => {},
  onSearchStrList: async () => [],
  setSongListFile: async () => {},
  setSongEventHandle: async () => {},
  setSongStoreHandle: async () => {},
  setLyricsHandle: () => {},
  lyrics: [],
  songStore: new Map(),
  songList: undefined,
  songEvent: undefined,
  volumeController: [],
});

export const MixerProvider: FC<MixerProviderProps> = ({ children }) => {
  const { synth } = useSynth();
  const { messages, sendMessage } = useRemote();

  // Volume Control
  const VolChannel = Array(16).fill(100);
  const [volumeController, setVolumeController] =
    useState<number[]>(VolChannel);

  // Trie Search
  const [songList, setSongList] = useState<TrieSearch<SearchResult>>();

  // Song File System
  const [songStore, setSongStore] = useState<
    Map<string, FileWithDirectoryAndFileHandle>
  >(new Map());

  // Playing Song
  // --- Song
  const [songEvent, setSongEvent] = useState<SearchResult>();
  // --- Lyrics
  const [lyrics, setLyrics] = useState<string[]>([]);

  const setLyricsHandle = (lyr: string[]) => {
    setLyrics(lyr);
  };

  const setSongStoreHandle = (
    files: Map<string, FileWithDirectoryAndFileHandle>
  ) => {
    setSongStore(files);
  };

  const setSongEventHandle = (value: SearchResult) => {
    setSongEvent(value);
  };

  const onSearchStrList = (str: string) => {
    if (!songList) {
      return;
    }
    return onSearchList<SearchResult>(str, songList);
  };

  const setSongListFile = async (file: File) => {
    const trie = await addSongList<SearchResult>(file);
    setSongList(trie);
  };

  const updateVolume = (index: number, value: number) => {
    setVolumeController((ch) => {
      ch[index] = value;
      return ch;
    });
  };

  const eventRemote = async (from?: string, content?: RemoteEncode) => {
    const type = content?.type;
    const data = content?.data;

    if (!type) {
      return;
    }
    switch (type) {
      case "GIND_NODE":
        return data as number[];

      case "SET_CHANNEL":
        if (!synth) {
          return;
        }
        const vol = data as ISetChannelGain;
        updateVolume(vol.channel, vol.value);
        volumeChange(vol.channel, vol.value, synth);
        return data as ISetChannelGain;

      case "SEARCH_SONG":
        if (songList !== undefined) {
          const search = data as string;
          const res = await onSearchStrList(search);
          sendMessage(res, "SEND_SONG_LIST", from);
        }

      case "SET_SONG":
        const song = data as SearchResult;
        setSongEventHandle(song);

      default:
        return data;
    }
  };

  useEffect(() => {
    eventRemote(messages?.from, messages?.content);
  }, [messages?.content]);

  return (
    <MixerContext.Provider
      value={{
        updateVolume: updateVolume,
        volumeController: volumeController,
        setSongListFile: setSongListFile,
        onSearchStrList: onSearchStrList,
        setSongEventHandle: setSongEventHandle,
        setSongStoreHandle: setSongStoreHandle,
        setLyricsHandle: setLyricsHandle,
        lyrics: lyrics,
        songStore: songStore,
        songList: songList,
        songEvent: songEvent,
      }}
    >
      <>{children}</>
    </MixerContext.Provider>
  );
};
