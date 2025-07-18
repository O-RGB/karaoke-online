"use client";

import React, { useEffect, useState } from "react";
import VolumePanel from "../tools/volume-panel";
import PlayerPanel from "../tools/player-panel";
import SearchSong from "../tools/search-song/search-song";
import ClientHostRemote from "../remote/client/client-host";
import SoundfontManager from "../modal/soundfont";
import ClockPanel from "../tools/clock-panel";
import ContextModal from "../modal/context-modal";
import TempoPanel from "../tools/tempo-panel";
import StatusPanel from "../tools/status/status-panel";
import WallpaperModal from "../modal/display/tabs/wallpaper-modal";
import DisplaySettingModal from "../modal/display";
import useNotificationStore from "@/features/notification-store";
import WallpaperRender from "./wallpaper-render/wallpaper-render";
import useConfigStore from "@/features/config/config-store";
import QueueSong from "../tools/queue-song/queue-song";
import useKeyboardStore from "@/features/keyboard-state";
import NextSongPanel from "../tools/next-song-panel";
import SongInfo from "../tools/song-info";
import SoundSettingModal from "../modal/sound-setting";
import RemoteEvent from "./remote-event";
import DonateModal from "../modal/donate-modal";
import AutoModal from "../modal/auto-modal";
import LyricsPlayer from "../../features/lyrics";
import Processing2Modal from "../common/alert/processing/processing-update";
import AppendSongModal from "../modal/append-song";
import useSongsStore from "@/features/songs/store/songs.store";
import DataStoresModal from "../modal/datastores";
import Loading from "../tools/loading";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { DatabaseService } from "@/utils/indexedDB/service";
import { SongsSystem } from "@/features/songs";
import { SoundfontSystemManager } from "@/features/soundfont";
import InstrumentalPanel from "../tools/instrumental-panel";
interface KaraokePageProps {}

const KaraokePage: React.FC<KaraokePageProps> = ({}) => {
  const setup = useSynthesizerEngine((state) => state.setup);

  const setSongsManager = useSongsStore((state) => state.setSongsManager);
  const setSoundfontManaer = useSongsStore((state) => state.setSoundfontManaer);
  const initializeKeyboardListeners = useKeyboardStore(
    (state) => state.initializeKeyboardListeners
  );

  const handle = useFullScreenHandle();
  const notification = useNotificationStore((state) => state.notification);
  const config = useConfigStore((state) => state.config);
  const [onPrepare, setPrepare] = useState<boolean>(false);

  const startup = async () => {
    setPrepare(true);
    const db = new DatabaseService();
    await db.initialize();

    const soundMode = config.system?.soundMode ?? "PYTHON_API_SYSTEM";
    const engine = await setup(config.system?.engine);
    initializeKeyboardListeners();

    const soundSystem = new SongsSystem(config.system);
    setSongsManager(soundSystem);
    soundSystem.init(soundMode);
    const soundfontSystem = new SoundfontSystemManager(engine, soundMode);
    setSoundfontManaer(soundfontSystem);

    setTimeout(() => {
      setPrepare(false);
    }, 1000);
  };

  useEffect(() => {
    startup();
  }, []);

  const modalMap: ModalComponents = {
    SOUNDFONT_MODEL: <SoundfontManager></SoundfontManager>,
    SUPER_JOIN: <ClientHostRemote></ClientHostRemote>,
    MUSIC_STORE: <DataStoresModal></DataStoresModal>,
    ADD_MUSIC: <AppendSongModal></AppendSongModal>,
    // WALLPAPER: <WallpaperModal></WallpaperModal>,
    DISPLAY: <DisplaySettingModal></DisplaySettingModal>,
    SOUND_SETTING: <SoundSettingModal></SoundSettingModal>,
    DONATE: <DonateModal></DonateModal>,
  };

  return (
    <FullScreen handle={handle}>
      <Loading isLoad={onPrepare}></Loading>
      <Processing2Modal></Processing2Modal>
      <WallpaperRender></WallpaperRender>
      <RemoteEvent></RemoteEvent>
      <AutoModal auto title={""}></AutoModal>
      <div id="modal-container">
        <ContextModal modal={modalMap}>
          <StatusPanel notification={notification}></StatusPanel>
          <VolumePanel></VolumePanel>
          <TempoPanel></TempoPanel>
          <ClockPanel></ClockPanel>
          <SongInfo></SongInfo>
          <QueueSong></QueueSong>
          <NextSongPanel></NextSongPanel>
          <SearchSong></SearchSong>
          <LyricsPlayer></LyricsPlayer>
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
