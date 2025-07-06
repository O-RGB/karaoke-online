import { IAlertCommon } from "@/components/common/alert/types/alert.type";
import {
  FontDisplayManager,
  WallpaperDisplayManager,
} from "@/utils/indexedDB/db/display/table";
import {
  DircetoryLocalSongsManager,
  FilesLocalSongsManager,
  ChunkDataLocalSongsManager,
  MasterIndexLocalSongsManager,
} from "@/utils/indexedDB/db/local-songs/table";
import { SoundfontPlayerManager } from "@/utils/indexedDB/db/player/table";
import {
  FilesServerSongsManager,
  TracklistServerSongsManager,
} from "@/utils/indexedDB/db/server-cache/table";
import {
  FilesUserSongsManager,
  TracklistUserSongsManager,
} from "@/utils/indexedDB/db/user-songs/table";
import { DatabaseService } from "@/utils/indexedDB/service";
import React from "react";

interface ResetDatabaseProps extends IAlertCommon {}

const ResetDatabase: React.FC<ResetDatabaseProps> = ({ setAlert }) => {
  //   // user songs
  //   const filesUserSongsManager = new FilesUserSongsManager();
  //   const tracklistUserSongsManager = new TracklistUserSongsManager();

  //   // server songs
  //   const filesServerSongsManager = new FilesServerSongsManager();
  //   const tracklistServerSongsManager = new TracklistServerSongsManager();

  //   // file system songs
  //   const dircetoryLocalSongsManager = new DircetoryLocalSongsManager();

  //   // python songs
  //   const filesLocalSongsManager = new FilesLocalSongsManager();
  //   const chunkDataLocalSongsManager = new ChunkDataLocalSongsManager();
  //   const masterIndexLocalSongsManager = new MasterIndexLocalSongsManager();

  //   // optional reset
  //   const soundfontPlayerManager = new SoundfontPlayerManager();
  //   const fontDisplayManager = new FontDisplayManager();
  //   const wallpaperDisplayManager = new WallpaperDisplayManager();

  //   const onResetUserSong = async () => {
  //     await filesUserSongsManager.deleteDatabase();
  //     await tracklistUserSongsManager.deleteDatabase();
  //   };

  const deleteAllSetting = () => {
    const service = new DatabaseService();
    service.uninstall();
  };

  return (
    <>
      <div
        onClick={() => {
          deleteAllSetting();
        }}
      >
        Delete Database User song
      </div>
    </>
  );
};

export default ResetDatabase;
