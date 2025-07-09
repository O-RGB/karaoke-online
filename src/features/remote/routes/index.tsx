import React, { useEffect } from "react";
import { PeerHostState, usePeerHostStore } from "../store/peer-js-store";
import useSongsStore from "@/features/songs/store/songs.store";
import useQueuePlayer from "@/features/player/player/modules/queue-player";
import { ITrackData } from "@/features/songs/types/songs.type";

interface RemoteRouteHostProps {}

const RemoteRouteHost: React.FC<RemoteRouteHostProps> = ({}) => {
  const hostStore = usePeerHostStore();

  useEffect(() => {
    hostStore.addRoute("auth/login", async (payload) => {
      return {};
    });
  }, []);

  return <></>;
};

export default RemoteRouteHost;

export const remoteRoutes = () => {
  const client = usePeerHostStore.getState();

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
