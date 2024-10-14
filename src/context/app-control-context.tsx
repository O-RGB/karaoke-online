"use client";

import { createContext, FC, useEffect, useState } from "react";
import { useRemote } from "../hooks/peer-hook";
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
import { useSpessasynthStore } from "@/components/stores/spessasynth-store";

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
  getSystemDriveMode: () => boolean;
  setSystemDriveMode: (is: boolean) => void;
  hideVolume: boolean;
  musicLibrary: Map<string, File>;
  tracklist: TrieSearch<SearchResult> | undefined;
  playingTrack: SearchResult | undefined;
  volumeController: number[];
  cursorIndices: Map<number, number[]> | undefined;
  lyrics: string[];
  cursorTicks: number[];
  midiPlaying: MIDI | undefined;
  isVolumeHeld: boolean;
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
  getSystemDriveMode: () => false,
  setSystemDriveMode: () => {},
  hideVolume: false,
  lyrics: [],
  cursorTicks: [],
  musicLibrary: new Map(),
  cursorIndices: new Map(),
  tracklist: undefined,
  playingTrack: undefined,
  volumeController: [],
  midiPlaying: undefined,
  isVolumeHeld: false,
});

export const AppControlProvider: FC<AppControlProviderProps> = ({
  children,
}) => {
  const { synth, player } = useSpessasynthStore();
  const { received: messages, sendMessage } = useRemote();
  const { addNotification } = useNotification();

  // Fetch Option
  const [driveMode, setDriveMode] = useState<boolean>(false);

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

  // Playing Song
  // --- Song
  const [playingTrack, setPlayingTrack] = useState<SearchResult>();
  const [midiPlaying, setMidiPlaying] = useState<MIDI>();

  // --- Lyrics
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [cursorTicks, setCursor] = useState<number[]>([]);
  const [cursorIndices, setCursorIndices] = useState<Map<number, number[]>>();

  const setSystemDriveMode = (is: boolean) => {
    setDriveMode(is);
  };

  const getSystemDriveMode = () => {
    return driveMode;
  };

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
    const SEMITONE_STEP = PITCH_CENTER / 12; // แก้ไขเป็น 12 แทน 2

    const pitchValue = PITCH_CENTER + semitones * SEMITONE_STEP;
    const MSB = (pitchValue >> 7) & 0x7f;
    const LSB = pitchValue & 0x7f;

    const sendPitch = (channel: number) => {
      synth?.setPitchBendRange(channel, 12); // ตั้งค่า pitch bend range เป็น 12 semitones
      synth?.pitchWheel(channel, MSB, LSB);
      // synth?.lockController(channel, midiControllers.effects3Depth, true);
    };

    if (channel !== undefined) {
      sendPitch(channel);
    } else {
      for (let i = 0; i < 16; i++) {
        sendPitch(i);
      }
    }
  };
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
      }, 500);
    }
  };

  const loadAndPlaySong = async (value: SearchResult) => {
    let mode: string = "";
    if (driveMode) {
      mode = " Drive";
    } else {
      mode = "ระบบ";
    }
    addNotification(
      "กำลังโหลดจาก" + mode,
      <AiOutlineLoading className="animate-spin"></AiOutlineLoading>,
      40000
    );
    const song = await getSong(value, driveMode);
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
        getSystemDriveMode,
        setSystemDriveMode,
        hideVolume,
        volumeController,
        lyrics,
        cursorTicks,
        musicLibrary,
        tracklist,
        playingTrack,
        cursorIndices,
        midiPlaying,
        isVolumeHeld,
      }}
    >
      <>{children}</>
    </AppControlContext.Provider>
  );
};
