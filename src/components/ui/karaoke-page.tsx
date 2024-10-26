"use client";

import React, { useEffect, useRef } from "react";
import VolumePanel from "../tools/volume-panel";
import PlayerPanel from "../tools/player-panel";
import SearchSong from "../tools/search-song/search-song";
import LyricsPanel from "../tools/lyrics-panel";
import HostRemote from "../remote/host";
import SuperHostRemote from "../remote/super/super-host";

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
import { FullScreen, useFullScreenHandle } from "react-full-screen";
interface KaraokePageProps {}

const KaraokePage: React.FC<KaraokePageProps> = ({}) => {
  const setupSpessasynth = useSpessasynthStore(
    (state) => state.setupSpessasynth
  );
  const analysers = useSpessasynthStore((state) => state.analysers);

  const player = useSpessasynthStore((state) => state.player);
  const addTracklist = useTracklistStore((state) => state.addTracklist);
  const initializeKeyboardListeners = useKeyboardStore(
    (state) => state.initializeKeyboardListeners
  );
  const setSongPlaying = usePlayer((state) => state.setSongPlaying);
  const loadAndPlaySong = usePlayer((state) => state.loadAndPlaySong);
  const handle = useFullScreenHandle();
  const fullscreenRef = useRef(null);
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
    DRIVE_SETTING: <DriveSetting></DriveSetting>,
  };

  if (!player) {
    return <></>;
  }

  console.log("main rerender");

  return (
    <FullScreen handle={handle}>
      <DragDrop setSongPlaying={setSongPlaying}></DragDrop>
      {/* Process */}
      <WallpaperRender></WallpaperRender>
      <RemoteRender></RemoteRender>

      <TicksRender></TicksRender>
      <LyricsRender></LyricsRender>
      <GainRender analysers={analysers}></GainRender>
      <VolumeEvnet></VolumeEvnet>
      <InstrumentsEvent></InstrumentsEvent>

      {/* Contact */}
      <div id="modal-container">
        <ContextModal modal={modalMap}>
          <OptionsPanel className="hidden flex-col gap-2 lg:flex fixed top-[40%] right-5"></OptionsPanel>
          <StatusPanel notification={notification}></StatusPanel>
          <VolumePanel analysers={analysers}></VolumePanel>
          <TempoPanel></TempoPanel>
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
          <LyricsPanel></LyricsPanel>
          <PlayerPanel
            isFullScreen={handle.active}
            modalMap={modalMap}
            onFullScreen={() => {
              if (!handle.active) {
                handle.enter();
              } else {
                handle.exit();
              }
            }}
          ></PlayerPanel>
        </ContextModal>
      </div>
    </FullScreen>
  );
};

export default KaraokePage;
