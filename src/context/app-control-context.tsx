"use client";

import { createContext, FC, useEffect, useState } from "react";
import { convertCursorToTicks, mapCursorToIndices } from "@/lib/app-control";
import { addAllTrie, onSearchList } from "@/lib/trie-search";
import { MIDI, midiControllers } from "spessasynth_lib";

import { fixMidiHeader } from "@/lib/karaoke/ncn";
import TrieSearch from "trie-search";
import React from "react";
import { jsonTracklistToDatabase } from "@/lib/storage/tracklist";
import { getSong } from "@/lib/storage/song";
import { useNotification } from "@/hooks/notification-hook";
import { AiOutlineLoading } from "react-icons/ai";
import { useSpessasynthStore } from "@/stores/spessasynth-store";
import { usePeerStore } from "@/stores/peer-store";
import useConfigStore from "@/stores/config-store";

type AppControlContextType = {
  onSearchStrList: (str: string) => Promise<SearchResult[]> | undefined;
  setTracklistFile: (file: File) => Promise<void>;
  setRemoveTracklistFile: () => Promise<void>;
  setPlayingTrackFile: (value: SearchResult) => void;
  setMusicLibraryFile: (files: Map<string, File>) => void;
  handleSetLyrics: (lyr: string[]) => void;
  setSongPlaying: (files: SongFilesDecode) => Promise<void>;
  loadAndPlaySong: (value: SearchResult) => Promise<void>;
  addTracklist: (item: SearchResult[]) => void;
  musicLibrary: Map<string, File>;
  tracklist: TrieSearch<SearchResult> | undefined;
  playingTrack: SearchResult | undefined;
  cursorIndices: Map<number, number[]> | undefined;
  lyrics: string[];
  cursorTicks: number[];
  midiPlaying: MIDI | undefined;
};

type AppControlProviderProps = {
  children: React.ReactNode;
};

export const AppControlContext = createContext<AppControlContextType>({
  // updateVolumeSysth: () => {},
  onSearchStrList: async () => [],
  setTracklistFile: async () => {},
  setRemoveTracklistFile: async () => {},
  setPlayingTrackFile: async () => {},
  setMusicLibraryFile: async () => {},
  handleSetLyrics: () => {},
  setSongPlaying: async () => {},
  loadAndPlaySong: async () => {},
  addTracklist: () => {},
  lyrics: [],
  cursorTicks: [],
  musicLibrary: new Map(),
  cursorIndices: new Map(),
  tracklist: undefined,
  playingTrack: undefined,
  midiPlaying: undefined,
});

export const AppControlProvider: FC<AppControlProviderProps> = ({
  children,
}) => {
  const { synth, player } = useSpessasynthStore();
  const { received: messages, sendMessage } = usePeerStore();
  const System = useConfigStore((state) => state.config.system?.drive);

  const { addNotification } = useNotification();

  // Trie Search
  const [tracklist, setTracklist] = useState<TrieSearch<SearchResult>>();

  // Song File System
  const [musicLibrary, setMusicLibrary] = useState<Map<string, File>>(
    new Map()
  );

  // Playing Song
  // --- Song
  const [playingTrack, setPlayingTrack] = useState<SearchResult>();
  const [midiPlaying, setMidiPlaying] = useState<MIDI>();

  // --- Lyrics
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [cursorTicks, setCursor] = useState<number[]>([]);
  const [cursorIndices, setCursorIndices] = useState<Map<number, number[]>>();

  const resetVolume = () => {
    Array.from({ length: 16 }, (_, i) => {
      updateVolumeSysth(i, 100);
    });
  };

  const updateVolumeSysth = (channel: number, vol: number) => {
    synth?.controllerChange(channel, midiControllers.mainVolume, vol);
  };

  const handleSetLyrics = (lyr: string[]) => {
    setLyrics(lyr);
  };

  const handleSetCursor = (ticksPerBeat: number, cursor: number[]) => {
    if (!player) {
      return;
    }
    const cur = convertCursorToTicks(ticksPerBeat, cursor);
    const curMapping = mapCursorToIndices(cur);
    setCursorIndices(curMapping);
    setCursor(cur);
  };

  const setMusicLibraryFile = (files: Map<string, File>) => {
    setMusicLibrary(files);
  };

  const setPlayingTrackFile = (value: SearchResult) => {
    setPlayingTrack(value);
  };

  const onSearchStrList = (str: string) => {
    if (!tracklist) {
      return;
    }
    return onSearchList<SearchResult>(str, tracklist);
  };

  const setTracklistFile = async (file: File) => {
    const toDatabase = await jsonTracklistToDatabase(file);
    if (toDatabase) {
      const trie = addAllTrie(toDatabase);
      setTracklist(trie);
    }
  };

  const addTracklist = (items: SearchResult[]) => {
    if (tracklist) {
      const updatedTrie = tracklist;
      items.forEach((item) => updatedTrie.add(item));
      setTracklist(updatedTrie);
    } else {
      const trie = addAllTrie(items);
      setTracklist(trie);
    }
  };

  const setRemoveTracklistFile = async () => {
    setTracklist(undefined);
  };

  const setSongPlaying = async (files: SongFilesDecode) => {
    if (!player) {
      return;
    }
    resetVolume();
    player.pause();
    player.stop();
    handleSetLyrics([]);
    handleSetCursor(0, []);

    let midiFileArrayBuffer = await files.mid.arrayBuffer();
    let parsedMidi = null;
    try {
      parsedMidi = new MIDI(midiFileArrayBuffer, files.mid.name);
    } catch (e) {
      let error: string = (e as string).toString();
      let typeError: string = `SyntaxError: Invalid MIDI Header! Expected "MThd", got`;
      console.error(error);
      // if (error === typeError) {
      const fix = await fixMidiHeader(files.mid);
      const fixArrayBuffer = await fix.arrayBuffer();
      parsedMidi = new MIDI(fixArrayBuffer, fix.name);
      // }
    }

    if (parsedMidi) {
      setTimeout(async () => {
        setMidiPlaying(parsedMidi);
        const timeDivision = parsedMidi.timeDivision;
        handleSetLyrics(files.lyr);
        handleSetCursor(timeDivision, files.cur);
        player.loadNewSongList([parsedMidi]);
        player.play();
      }, 1000);
    }
  };

  const loadAndPlaySong = async (value: SearchResult) => {
    let mode: string = "";
    if (System) {
      mode = " Drive";
    } else {
      mode = "ระบบ";
    }
    addNotification(
      "กำลังโหลดจาก" + mode,
      <AiOutlineLoading className="animate-spin"></AiOutlineLoading>,
      40000
    );
    const song = await getSong(value, System);
    if (song) {
      setSongPlaying(song);
      addNotification("เสร็จสิ้น");
    } else {
      addNotification("ไม่พบเพลงใน" + mode);
    }
  };

  const eventRemote = async (from?: string, content?: RemoteSendMessage) => {
    const type = content?.type;
    const data = content?.message;
    const user = content?.user;

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
        let vol = data as ISetChannelGain;
        updateVolumeSysth(vol.channel, vol.value);
        return data as ISetChannelGain;

      case "SEARCH_SONG":
        if (tracklist !== undefined) {
          let search = data as string;
          let res = await onSearchStrList(search);
          sendMessage({
            message: res,
            type: "SEND_SONG_LIST",
            user: user ?? "NORMAL",
            clientId: from,
          });
        }
        break;

      case "SET_SONG":
        let song = data as SearchResult;
        if (song) {
          loadAndPlaySong(song);
          setPlayingTrackFile(song);
        }
        break;

      case "UPLOAD_SONG":
        console.log("remote...");
        let uploaded = data as SongFiltsEncodeAndDecode;
        if (uploaded) {
          const blob = new Blob([uploaded.mid]);

          const receivedFile = new File([blob], "midi", {
            lastModified: Date.now(),
          });

          let getDecode: SongFilesDecode = {
            cur: uploaded.cur,
            lyr: uploaded.lyr,
            mid: receivedFile,
          };
          setSongPlaying(getDecode);
        }

      default:
        return data;
    }
  };

  useEffect(() => {
    eventRemote(messages?.from, messages?.content);
  }, [messages?.content]);

  return (
    <AppControlContext.Provider
      value={{
        setTracklistFile,
        onSearchStrList,
        setPlayingTrackFile,
        setRemoveTracklistFile,
        setMusicLibraryFile,
        handleSetLyrics,
        setSongPlaying,
        loadAndPlaySong,
        addTracklist,
        lyrics,
        cursorTicks,
        musicLibrary,
        tracklist,
        playingTrack,
        cursorIndices,
        midiPlaying,
      }}
    >
      <>{children}</>
    </AppControlContext.Provider>
  );
};
