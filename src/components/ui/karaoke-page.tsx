"use client";

import React, { useEffect } from "react";
import VolumePanel from "../tools/volume-panel";
import PlayerPanel from "../tools/player-panel";
import SearchSong from "../tools/search-song/search-song";
import LyricsPanel from "../tools/lyrics-panel";
import HostRemote from "../remote/host";
import SuperHostRemote from "../remote/super-host";

import SoundfontManager from "../modal/sound-font-manager";
import ClockPanel from "../tools/clock-panel";
import ContextModal from "../modal/context-modal";
import AppendSongModal from "../modal/append-song";
import TempoPanel from "../tools/tempo-panel";
import StatusPanel from "../tools/status/status-panel";
import OptionsPanel from "../tools/options-panel";
import WallpaperModal from "../modal/wallpaper-modal";
import MidiSettingModal from "../modal/midi-setting-modal";
import { getTracklist } from "@/lib/storage/tracklist";
import DriveSetting from "../modal/drive-setting-modal";
import TicksRender from "./ticks-render/ticks-render";
import LyricsRender from "./lyrics-render/lyrics-render";
import GainRender from "./gain-render/gain-render";
import VolumeEvnet from "./event-render/volume-event";
import InstrumentsEvent from "./event-render/instruments-event";
import DisplaySettingModal from "../modal/display";
import { useSpessasynthStore } from "../../stores/spessasynth-store";
import { DragDrop } from "../tools/drag-drop/drag-drop";
import { usePeerStore } from "@/stores/peer-store";
import DataStoresModal from "../modal/datastores";
import useTracklistStore from "@/stores/tracklist-store";
import RemoteRender from "./remote-render/remote-render";
import useNotificationStore from "@/stores/notification-store";
import { usePlayer } from "@/stores/player-store";
import WallpaperRender from "./wallpaper-render/wallpaper-render";
import useConfigStore from "@/stores/config-store";
import QueueSong from "../tools/queue-song/queue-song";
import useKeyboardStore from "@/stores/keyboard-state";
import NextSongPanel from "../tools/next-song-panel";

interface KaraokePageProps {}

const KaraokePage: React.FC<KaraokePageProps> = ({}) => {
  const { perset, analysers, setupSpessasynth } = useSpessasynthStore();
  const player = useSpessasynthStore((state) => state.player);
  const addTracklist = useTracklistStore((state) => state.addTracklist);
  const initializeKeyboardListeners = useKeyboardStore(
    (state) => state.initializeKeyboardListeners
  );

  const midiPlaying = usePlayer((state) => state.midiPlaying);
  const cursorTicks = usePlayer((state) => state.cursorTicks);
  const cursorIndices = usePlayer((state) => state.cursorIndices);
  const lyrics = usePlayer((state) => state.lyrics);
  const setSongPlaying = usePlayer((state) => state.setSongPlaying);
  const loadAndPlaySong = usePlayer((state) => state.loadAndPlaySong);

  const notification = useNotificationStore((state) => state.notification);
  const config = useConfigStore((state) => state.config);

  const startup = async () => {
    setupSpessasynth();
    initializeKeyboardListeners();
    let tl: SearchResult[] = [];

    if (config.system?.drive) {
      tl = await getTracklist(["DRIVE"]);
    } else {
      tl = await getTracklist(["CUSTOM", "EXTHEME"]);
    }
    addTracklist(tl);
  };

  useEffect(() => {
    startup();
  }, []);

  const modalMap: ModalComponents = {
    SOUNDFONT_MODEL: <SoundfontManager></SoundfontManager>,
    JOIN: <HostRemote></HostRemote>,
    SUPER_JOIN: <SuperHostRemote></SuperHostRemote>,
    MUSIC_STORE: <DataStoresModal></DataStoresModal>,
    ADD_MUSIC: <AppendSongModal></AppendSongModal>,
    WALLPAPER: <WallpaperModal></WallpaperModal>,
    DISPLAY: <DisplaySettingModal></DisplaySettingModal>,
    MIDI_SETTING: <MidiSettingModal></MidiSettingModal>,
    // SONG_LIST: <SongListModal></SongListModal>,
    DRIVE_SETTING: <DriveSetting></DriveSetting>,
  };

  if (!player) {
    return <></>;
  }

  console.log("main rerender");

  return (
    <>
      <DragDrop setSongPlaying={setSongPlaying}></DragDrop>
      {/* Process */}
      <WallpaperRender></WallpaperRender>
      <RemoteRender></RemoteRender>

      <TicksRender midiPlaying={midiPlaying}></TicksRender>
      <LyricsRender
        cursorIndices={cursorIndices}
        cursorTicks={cursorTicks}
        lyrics={lyrics}
      ></LyricsRender>
      <GainRender analysers={analysers}></GainRender>
      <VolumeEvnet></VolumeEvnet>
      <InstrumentsEvent></InstrumentsEvent>

      {/* Contact */}
      <ContextModal modal={modalMap}>
        <OptionsPanel className="hidden flex-col gap-2 lg:flex fixed top-[40%] right-5"></OptionsPanel>
        <StatusPanel notification={notification}></StatusPanel>
        <VolumePanel perset={perset} analysers={analysers}></VolumePanel>
        <TempoPanel timeDivision={midiPlaying?.timeDivision}></TempoPanel>
        <ClockPanel></ClockPanel>
        <QueueSong></QueueSong>
        <NextSongPanel></NextSongPanel>
        <SearchSong
          onClickSong={async (value) => {
            const data = await loadAndPlaySong(value);
            if (data) {
              if (data.length <= 1) {
                const { file, songInfo } = data[0];
                setSongPlaying(file, songInfo);
              }
            }
          }}
        ></SearchSong>
        <LyricsPanel
          cursorIndices={cursorIndices}
          cursorTicks={cursorTicks}
          lyrics={lyrics}
        ></LyricsPanel>
        <PlayerPanel lyrics={lyrics} modalMap={modalMap}></PlayerPanel>
      </ContextModal>
    </>
  );
};

export default KaraokePage;
