import useSongsStore from "@/features/songs/store/songs.store";
import { usePeerHostStore } from "../../store/peer-js-store";
import { RemoteReceivedMessages } from "../../types/remote.type";

export const remoteEvents = async (message: RemoteReceivedMessages) => {
  const sendMessage = usePeerHostStore.getState().sendMessage;
  const songsManager = useSongsStore.getState().songsManager;

  const type = message.content.type;
  const body = message.content.message;
  const clientId = message.content.clientId;

  switch (type) {
    case "SEARCH":
      const data: string = body;
      const list = (await songsManager?.manager?.search(data)) ?? [];
      sendMessage({
        user: "NORMAL",
        message: list,
        clientId: clientId,
        type: "SEARCH",
      });
      break;

    default:
      break;
  }
};
