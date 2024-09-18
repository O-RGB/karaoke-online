"use client";

import { createContext, FC, useEffect, useState } from "react";
import { useSynth } from "../hooks/spessasynth-hook";
import { useRemote } from "../hooks/peer-hook";
import {
  convertCursorToTicks,
  mapCursorToIndices,
  volumeChange,
} from "@/lib/app-control";
import TrieSearch from "trie-search";
import { addSongList, onSearchList } from "@/lib/trie-search";
import { MIDI } from "spessasynth_lib";
import { loadSuperZipAndExtractSong } from "@/lib/zip";

type AppControlContextType = {
  updateVolume: (index: number, value: number) => void;
  onSearchStrList: (str: string) => Promise<SearchResult[]> | undefined;
  setTracklistFile: (file: File) => Promise<void>;
  setPlayingTrackFile: (value: SearchResult) => void;
  setMusicLibraryFile: (files: Map<string, File>) => void;
  handleSetLyrics: (lyr: string[]) => void;
  setSongPlaying: (files: SongFilesDecode) => Promise<void>;
  loadAndPlaySong: (value: SearchResult) => Promise<void>;
  musicLibrary: Map<string, File>;
  tracklist: TrieSearch<SearchResult> | undefined;
  playingTrack: SearchResult | undefined;
  volumeController: number[];
  cursorIndices: Map<number, number[]> | undefined;
  lyrics: string[];
  cursorTicks: number[];
  midiPlaying: MIDI | undefined;
  // ticks: number;
};

type AppControlProviderProps = {
  children: React.ReactNode;
};

export const AppControlContext = createContext<AppControlContextType>({
  updateVolume: () => {},
  onSearchStrList: async () => [],
  setTracklistFile: async () => {},
  setPlayingTrackFile: async () => {},
  setMusicLibraryFile: async () => {},
  handleSetLyrics: () => {},
  setSongPlaying: async () => {},
  loadAndPlaySong: async () => {},
  lyrics: [],
  cursorTicks: [],
  // ticks: 0,
  musicLibrary: new Map(),
  cursorIndices: new Map(),
  tracklist: undefined,
  playingTrack: undefined,
  volumeController: [],
  midiPlaying: undefined,
});

export const AppControlProvider: FC<AppControlProviderProps> = ({
  children,
}) => {
  const { synth, player } = useSynth();
  const { messages, sendMessage } = useRemote();

  // Volume Control
  const VolChannel = Array(16).fill(100);
  const [volumeController, setVolumeController] =
    useState<number[]>(VolChannel);

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
  // const [ticks, setTicks] = useState<number>(0);

  const synthEventController = () => {
    synth?.eventHandler.addEvent("controllerchange", "", (e) => {
      const controllerNumber = e.controllerNumber;
      const controllerValue = e.controllerValue;
      const channel = e.channel;
      if (controllerNumber === 7) {
        // updateVolume(channel, controllerValue);
        // volumeChange(channel, controllerValue, synth);
      }
    });
  };
  const handleSetLyrics = (lyr: string[]) => {
    console.log(lyr);
    setLyrics(lyr);
  };

  const handleSetCursor = (ticksPerBeat: number, cursor: number[]) => {
    if (!player) {
      return;
    }
    const cur = convertCursorToTicks(ticksPerBeat, cursor);
    console.log(player);
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
    const trie = await addSongList<SearchResult>(file);
    setTracklist(trie);
  };

  const updateVolume = (index: number, value: number) => {
    setVolumeController((ch) => {
      ch[index] = value;
      return ch;
    });
  };

  const setSongPlaying = async (files: SongFilesDecode) => {
    if (!player) {
      return;
    }
    const midiFileArrayBuffer = await files.mid.arrayBuffer();
    const parsedMidi = new MIDI(midiFileArrayBuffer, files.mid.name);
    player.loadNewSongList([parsedMidi]);
    setMidiPlaying(parsedMidi);

    const timeDivision = parsedMidi.timeDivision;
    handleSetLyrics([]);
    handleSetLyrics(files.lyr);
    handleSetCursor(timeDivision, files.cur);
  };

  const loadAndPlaySong = async (value: SearchResult) => {
    const song = await loadSuperZipAndExtractSong(musicLibrary, value);
    if (song) {
      setSongPlaying(song);
    }
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
        if (tracklist !== undefined) {
          const search = data as string;
          const res = await onSearchStrList(search);
          sendMessage(res, "SEND_SONG_LIST", from);
        }

      case "SET_SONG":
        const song = data as SearchResult;
        if (song) {
          loadAndPlaySong(song);
          setPlayingTrackFile(song);
        }

      default:
        return data;
    }
  };

  useEffect(() => {
    eventRemote(messages?.from, messages?.content);
  }, [messages?.content]);

  useEffect(() => {
    synthEventController();
  }, [synth]);

  return (
    <AppControlContext.Provider
      value={{
        updateVolume,
        setTracklistFile,
        onSearchStrList,
        setPlayingTrackFile,
        setMusicLibraryFile,
        handleSetLyrics,
        setSongPlaying,
        loadAndPlaySong,
        volumeController,
        lyrics,
        // ticks,
        cursorTicks,
        musicLibrary,
        tracklist,
        playingTrack,
        cursorIndices,
        midiPlaying
      }}
    >
      <>{children}</>
    </AppControlContext.Provider>
  );
};
