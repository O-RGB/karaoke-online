import { usePeerHostStore } from "../store/peer-js-store";
import useSongsStore from "@/features/songs/store/songs.store";
import useQueuePlayer from "@/features/player/player/modules/queue-player";
import {
  ITrackData,
  KaraokeExtension,
  MusicLoadAllData,
} from "@/features/songs/types/songs.type";
import { musicProcessGroup } from "@/lib/karaoke/read";
// import useRuntimePlayer from "@/features/player/player/modules/runtime-player";

export const remoteRoutes = () => {
  const client = usePeerHostStore.getState();

  client.addRoute("system/init", async (payload) => {
    // const musicInfo = useRuntimePlayer.getState().musicInfo;
    // console.log("system/init, musicInfo",musicInfo);
    // return { musicInfo };
  });

  client.addRoute("songs/search", async (payload) => {
    const { search } = payload;
    const songsManager = useSongsStore.getState().songsManager;
    const response = (await songsManager?.onSearch(search)) ?? [];
    return response;
  });

  client.addRoute("songs/quere", async (payload) => {
    const queue = useQueuePlayer.getState().queue;
    return queue;
  });

  client.addRoute("songs/send-file", async (payload) => {
    const addQueue = useQueuePlayer.getState().addQueue;
    try {
      const { arrayBuffer, filename, ext } = payload;

      console.log({ arrayBuffer, filename, ext });
      const blob = new Blob([arrayBuffer], {
        type: "application/octet-stream",
      });
      const newFile = new File([blob], `${filename}.${ext}`, {
        type: "application/octet-stream",
      });

      console.log(newFile);

      let karaokeExtension: KaraokeExtension = {};
      if (ext == "ykr") {
        karaokeExtension.ykr = newFile;
      }

      const readed = await musicProcessGroup(karaokeExtension);
      readed.files = karaokeExtension;
      readed.trackData._bufferFile = readed;
      addQueue(readed.trackData);
    } catch (error) {
      console.error(error);
    }
  });

  client.addRoute(
    "songs/select",
    async (payload: { tracklist: ITrackData }, clientId) => {
      const { tracklist } = payload;
      const addQueue = useQueuePlayer.getState().addQueue;

      if (tracklist) {
        addQueue(tracklist);
        return {
          data: true,
        };
      } else {
        return {
          data: false,
        };
      }
    }
  );
};
