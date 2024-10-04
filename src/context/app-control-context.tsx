"use client";

import { createContext, FC, useCallback, useEffect, useState } from "react";
import { useSynth } from "../hooks/spessasynth-hook";
import { useRemote } from "../hooks/peer-hook";
import { convertCursorToTicks, mapCursorToIndices } from "@/lib/app-control";
import { addAllTrie, onSearchList } from "@/lib/trie-search";
import { MIDI, midiControllers } from "spessasynth_lib";

import { fixMidiHeader } from "@/lib/karaoke/ncn";
import TrieSearch from "trie-search";
import React from "react";
import { jsonTracklistToDatabase } from "@/lib/storage/tracklist";
import { getSong } from "@/lib/storage/song";

type AppControlContextType = {
  updateVolumeSysth: (index: number, value: number) => void;
  onSearchStrList: (str: string) => Promise<SearchResult[]> | undefined;
  setTracklistFile: (file: File) => Promise<void>;
  setRemoveTracklistFile: () => Promise<void>;
  setPlayingTrackFile: (value: SearchResult) => void;
  setMusicLibraryFile: (files: Map<string, File>) => void;
  handleSetLyrics: (lyr: string[]) => void;
  setSongPlaying: (files: SongFilesDecode) => Promise<void>;
  loadAndPlaySong: (value: SearchResult) => Promise<void>;
  updateVolumeHeld: (held: boolean) => void;
  updatePitch: (semitones: number, channel?: number) => void;
  updatePerset: (channel: number, value: number) => void;
  updateHideVolume: (hide: boolean) => void;
  addTracklist: (item: SearchResult[]) => void;
  hideVolume: boolean;
  musicLibrary: Map<string, File>;
  tracklist: TrieSearch<SearchResult> | undefined;
  playingTrack: SearchResult | undefined;
  volumeController: number[];
  cursorIndices: Map<number, number[]> | undefined;
  lyrics: string[];
  cursorTicks: number[];
  midiPlaying: MIDI | undefined;
};

type AppControlProviderProps = {
  children: React.ReactNode;
};

export const AppControlContext = createContext<AppControlContextType>({
  updateVolumeSysth: () => {},
  onSearchStrList: async () => [],
  setTracklistFile: async () => {},
  setRemoveTracklistFile: async () => {},
  setPlayingTrackFile: async () => {},
  setMusicLibraryFile: async () => {},
  handleSetLyrics: () => {},
  setSongPlaying: async () => {},
  loadAndPlaySong: async () => {},
  updateVolumeHeld: () => {},
  updatePitch: () => {},
  updatePerset: () => {},
  updateHideVolume: () => {},
  addTracklist: () => {},
  hideVolume: false,
  lyrics: [],
  cursorTicks: [],
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
  const [isVolumeHeld, setIsVolumeHeld] = useState<boolean>(false);
  const [hideVolume, setHideVolume] = useState<boolean>(false);

  // Trie Search
  const [tracklist, setTracklist] = useState<TrieSearch<SearchResult>>();

  // Song File System
  const [musicLibrary, setMusicLibrary] = useState<Map<string, File>>(
    new Map()
  );

  // Notification
  // const [notification, setNotification] = useState<string>();

  // Playing Song
  // --- Song
  const [playingTrack, setPlayingTrack] = useState<SearchResult>();
  const [midiPlaying, setMidiPlaying] = useState<MIDI>();

  // --- Lyrics
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [cursorTicks, setCursor] = useState<number[]>([]);
  const [cursorIndices, setCursorIndices] = useState<Map<number, number[]>>();
  // const [lyricsDisplay, setLyricsDisplay] = useState<LyricsOptions>("default");

  // --- Wallpaper
  // const [wallpaper, setWallpaper] = useState<string>(WALLPAPER);

  // const setLyricsOptions = (mode: LyricsOptions) => {
  //   setLyricsDisplay(mode);
  // };

  // const addNotification = (text: string) => {
  //   setNotification(text);
  // };

  const updateHideVolume = (hide: boolean) => {
    setHideVolume(hide);
  };

  const updatePerset = (channel: number, value: number) => {
    synth?.programChange(channel, value);
  };

  const updateVolumeHeld = (held: boolean) => {
    setIsVolumeHeld(held);
  };

  const updatePitch = (semitones: number = 1, channel?: number) => {
    const PITCH_CENTER = 8192;
    const SEMITONE_STEP = PITCH_CENTER / 2;

    const pitchValue = PITCH_CENTER + semitones * SEMITONE_STEP;
    const MSB = (pitchValue >> 7) & 0x7f;
    const LSB = pitchValue & 0x7f;

    const sendPitch = (channel: number) => {
      synth?.pitchWheel(channel, MSB, LSB);
      synth?.setPitchBendRange(channel, semitones);
    };

    if (channel !== undefined) {
      sendPitch(channel);
    } else {
      Array.from({ length: 16 }, (_, i) => {
        sendPitch(i);
      });
    }
  };
  const resetVolume = () => {
    Array.from({ length: 16 }, (_, i) => {
      updateVolumeSysth(i, 100);
    });
  };

  const updateVolumeSysth = (channel: number, vol: number) => {
    synth?.controllerChange(channel, midiControllers.mainVolume, vol);
    setVolumeController((ch) => {
      ch[channel] = vol;
      return ch;
    });
  };

  const synthEventController = useCallback(
    (controllerNumber: number, controllerValue: number, channel: number) => {
      if (controllerNumber === 7 && isVolumeHeld === false) {
        updateVolumeSysth(channel, controllerValue);
      }
    },
    [isVolumeHeld]
  );

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
      console.log("page");
      return;
    }
    resetVolume();
    player.pause();
    handleSetLyrics([]);
    handleSetCursor(0, []);
    const midiFileArrayBuffer = await files.mid.arrayBuffer();
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
      }, 500);
    }
  };

  const loadAndPlaySong = async (value: SearchResult) => {
    const song = await getSong(musicLibrary, value);
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
        updateVolumeSysth(vol.channel, vol.value);
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
    synth?.eventHandler.addEvent("controllerchange", "", (e) => {
      const controllerNumber = e.controllerNumber;
      const controllerValue = e.controllerValue;
      const channel = e.channel;
      synthEventController(controllerNumber, controllerValue, channel);
    });
  }, [synth]);

  return (
    <AppControlContext.Provider
      value={{
        updateVolumeSysth,
        setTracklistFile,
        onSearchStrList,
        setPlayingTrackFile,
        setRemoveTracklistFile,
        setMusicLibraryFile,
        handleSetLyrics,
        setSongPlaying,
        loadAndPlaySong,
        updateVolumeHeld,
        updatePitch,
        updatePerset,
        updateHideVolume,
        addTracklist,
        hideVolume,
        volumeController,
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
