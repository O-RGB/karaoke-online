import { useSynthesizerEngine } from "@/features/engine/synth-store";
import useMixerStoreNew from "@/features/player/event-player/modules/event-mixer-store";
import useQueuePlayer from "@/features/player/player/modules/queue-player";
import { usePeerStore } from "@/features/remote/modules/peer-js-store";
import { RemoteReceivedMessages } from "@/features/remote/types/remote.type";
import useTracklistStore from "@/features/tracklist/tracklist-store";

import React, { useEffect } from "react";

interface RemoteEventProps {}

const RemoteEvent: React.FC<RemoteEventProps> = ({}) => {
  const received = usePeerStore((state) => state.received);
  const sendSuperUserMessage = usePeerStore(
    (state) => state.sendSuperUserMessage
  );
  const engine = useSynthesizerEngine((state) => state.engine);
  const searchTracklist = useTracklistStore((state) => state.searchTracklist);
  const addQueue = useQueuePlayer((state) => state.addQueue);

  const updatePitch = useMixerStoreNew((state) => state.updatePitch);

  const remoteTypeHandle = async (
    received: RemoteReceivedMessages | undefined
  ) => {
    const message = received?.content.message;
    const type = received?.content.type;

    if (!message) {
      return;
    }

    switch (type?.type) {
      case "SEARCH":
        let searchSong: string = message;
        const list = (await searchTracklist(searchSong)) ?? [];
        sendSuperUserMessage({
          user: "SUPER",
          message: list,
          type: {
            event: "CHANGE",
            type: "SEARCH",
          },
        });
        break;

      // case "CHANGE":
      //   // controllerItem?.setUserHolding(true);
      //   // let controllerChange = message.value as IControllerChange;
      //   // engine?.setController?.(
      //   //   controllerChange.channel,
      //   //   controllerChange.controllerNumber,
      //   //   controllerChange.controllerValue
      //   // );
      //   // controllerItem?.setUserHolding(false);
      //   break;
      // case "LOCK":
      //   // let lockControllerChange = message.value as ILockController;
      //   // engine?.lockController?.(
      //   //   lockControllerChange.channel,
      //   //   lockControllerChange.controllerNumber,
      //   //   lockControllerChange.isLocked
      //   // );
      //   break;

      // case "MUTE":
      //   // let muteControllerChange = message.value as IMuteController;
      //   // engine?.setMute?.(
      //   //   muteControllerChange.channel,
      //   //   muteControllerChange.isMute
      //   // );
      //   break;

      // case "PITCH":
      //   let pitchNumber = message.value as number;
      //   updatePitch(null, pitchNumber);
      //   break;

      // case "SEARCH":
      //   let searchSong: string = message.value as string;
      //   const list = (await searchTracklist(searchSong)) ?? [];
      //   let sendSearchList: ISearchCallBack = {
      //     eventType: "SEARCH_LIST",
      //     value: list,
      //   };
      //   send({
      //     user: "SUPER",
      //     message: sendSearchList,
      //   });
      //   break;

      case "SET_SONG":
        let song: SearchResult = message;
        if (song) {
          addQueue(song);
        }
        break;

      // case "QUEUE":
      //   // let sendQueuelist: ISearchCallBack = {
      //   //   eventType: "QUEUE_LIST",
      //   //   value: queue,
      //   // };
      //   // send({
      //   //   user: "SUPER",
      //   //   message: sendQueuelist,
      //   // });
      //   break;

      // case "SET_QUEUE":
      //   // let newQueue: SearchResult[] = message.value as SearchResult[];
      //   // moveQueue(newQueue);
      //   break;

      // case "NEXT":
      // // nextMusic();

      default:
        break;
    }
  };

  useEffect(() => {
    if (engine) {
      remoteTypeHandle(received);
    }
  }, [received, engine]);
  return <></>;
};

export default RemoteEvent;
