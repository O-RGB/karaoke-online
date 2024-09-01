"use client";

import { createContext, FC, useEffect, useState } from "react";
import { useSynth } from "../hooks/spessasynth-hooks";
import { useRemote } from "../hooks/peer-hooks";
import { volumeChange } from "@/lib/mixer";
import TrieSearch from "trie-search";
import { addSongList, onSearchList } from "@/lib/trie-search";

import { MIDI } from "spessasynth_lib";
import { loadSuperZipAndExtractSong } from "@/lib/zip";

type MixerContextType = {
  updateVolume: (index: number, value: number) => void;
  onSearchStrList: (str: string) => Promise<SearchResult[]> | undefined;
  setTracklistFile: (file: File) => Promise<void>;
  setPlayingTrackFile: (value: SearchResult) => void;
  setMusicLibraryFile: (files: Map<string, File>) => void;
  setLyricsHandle: (lyr: string[]) => void;
  setSongPlaying: (files: SongFilesDecode) => Promise<void>;
  loadAndPlaySong: (value: SearchResult) => Promise<void>;
  lyrics: string[];
  musicLibrary: Map<string, File>;
  tracklist: TrieSearch<SearchResult> | undefined;
  playingTrack: SearchResult | undefined;
  volumeController: number[];
};

type MixerProviderProps = {
  children: React.ReactNode;
};

export const MixerContext = createContext<MixerContextType>({
  updateVolume: () => {},
  onSearchStrList: async () => [],
  setTracklistFile: async () => {},
  setPlayingTrackFile: async () => {},
  setMusicLibraryFile: async () => {},
  setLyricsHandle: () => {},
  setSongPlaying: async () => {},
  loadAndPlaySong: async () => {},
  lyrics: [],
  musicLibrary: new Map(),
  tracklist: undefined,
  playingTrack: undefined,
  volumeController: [],
});

export const MixerProvider: FC<MixerProviderProps> = ({ children }) => {
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
  // --- Lyrics
  const [lyrics, setLyrics] = useState<string[]>([]);

  const synthEventController = () => {
    // synth?.eventHandler.addEvent("controllerchange", "", (e) => {
    //   const controllerNumber = e.controllerNumber;
    //   const controllerValue = e.controllerValue;
    //   const channel = e.channel;

    //   if (controllerNumber === 7) {
    //     // updateVolume(channel, controllerValue);
    //     // volumeChange(channel, controllerValue, synth);
    //   }
    // });
  };
  const setLyricsHandle = (lyr: string[]) => {
    setLyrics(lyr);
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
    player?.loadNewSongList([parsedMidi]);
    setLyricsHandle(files.lyr);
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
    <MixerContext.Provider
      value={{
        updateVolume,
        volumeController,
        setTracklistFile,
        onSearchStrList,
        setPlayingTrackFile,
        setMusicLibraryFile,
        setLyricsHandle,
        setSongPlaying,
        lyrics,
        musicLibrary,
        tracklist,
        playingTrack,
        loadAndPlaySong,
      }}
    >
      <>{children}</>
    </MixerContext.Provider>
  );
};
