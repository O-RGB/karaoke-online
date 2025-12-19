import useSongsStore from "@/features/songs/store/songs.store";
import useQueuePlayer from "@/features/player/player/modules/queue-player";
import { usePeerHostStore } from "../store/peer-js-store";
import { musicProcessGroup } from "@/lib/karaoke/read";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import {
  ITrackData,
  KaraokeExtension,
} from "@/features/songs/types/songs.type";

export const remoteRoutes = () => {
  const client = usePeerHostStore.getState();
  const engine = useSynthesizerEngine.getState().engine;

  client.addRoute("system/instrumental", async (payload) => {
    const instrumentals = useSynthesizerEngine.getState().engine?.instrumentals;
    if (!instrumentals) return {};
    const { gain, mute, lock, solo, key } = payload;
    const inst = instrumentals.get(key);
    if (!inst) return {};
    if (gain !== undefined) inst.setGain(gain);
    if (mute !== undefined) inst.setMute(mute);
    if (lock !== undefined) inst.setLock(lock);
    if (solo !== undefined) inst.setSolo(solo);
  });

  client.addRoute("system/play", async (payload) => {
    engine?.player?.play();
  });

  client.addRoute("system/pause", async (payload) => {
    engine?.player?.pause();
  });

  client.addRoute("system/next", async (payload) => {
    const queue = useQueuePlayer.getState();
    queue.nextMusic();
  });

  client.addRoute("system/vocal", async (payload) => {
    const { vocal } = payload;
    engine?.updatePitch(null, vocal);
  });

  client.addRoute("system/speed", async (payload) => {
    const { speed } = payload;
    engine?.updateSpeed(speed);
  });

  client.addRoute("songs/search", async (payload) => {
    const { search } = payload;
    const songsManager = useSongsStore.getState().songsManager;
    const response = (await songsManager?.onSearch(search)) ?? [];
    return response;
  });

  client.addRoute("songs/quere", async (payload) => {
    const queue = useQueuePlayer.getState();
    return queue.queue;
  });

  client.addRoute("songs/send-file", async (payload) => {
    const addQueue = useQueuePlayer.getState().addQueue;

    const { arrayBuffer, filename, ext } = payload;

    const blob = new Blob([arrayBuffer], {
      type: "application/octet-stream",
    });
    const newFile = new File([blob], `${filename}.${ext}`, {
      type: "application/octet-stream",
    });

    let karaokeExtension: KaraokeExtension = {};
    if (ext == "ykr") {
      karaokeExtension.ykr = newFile;
    }

    const readed = await musicProcessGroup(karaokeExtension);
    readed.files = karaokeExtension;
    readed.trackData._bufferFile = readed;
    addQueue(readed.trackData);
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
