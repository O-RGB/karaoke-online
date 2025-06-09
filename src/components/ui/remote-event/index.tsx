import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { MAIN_VOLUME } from "@/features/engine/types/node.type";
import {
  IControllerChange,
  IMuteController,
} from "@/features/engine/types/synth.type";
import useMixerStoreNew from "@/features/player/event-player/modules/event-mixer-store";
import useQueuePlayer from "@/features/player/player/modules/queue-player";
import { ISearchCallBack } from "@/features/player/player/types/player.type";
import { usePeerStore } from "@/features/remote/modules/peer-js-store";
import { RemoteReceivedMessages } from "@/features/remote/types/remote.type";
// import useTracklistStore from "@/features/tracklist/tracklist-store";

import React, { useEffect } from "react";

interface RemoteEventProps {}

const RemoteEvent: React.FC<RemoteEventProps> = ({}) => {
  const received = usePeerStore((state) => state.received);
  const sendSuperUserMessage = usePeerStore(
    (state) => state.sendSuperUserMessage
  );
  const engine = useSynthesizerEngine((state) => state.engine);
  // const searchTracklist = useTracklistStore((state) => state.searchTracklist);
  const addQueue = useQueuePlayer((state) => state.addQueue);
  const moveQueue = useQueuePlayer((state) => state.moveQueue);
  const queue = useQueuePlayer((state) => state.queue);

  const nextMusic = useQueuePlayer((state) => state.nextMusic);
  const updatePitch = useMixerStoreNew((state) => state.updatePitch);

  const remoteTypeHandle = async (
    received: RemoteReceivedMessages | undefined
  ) => {
    const message = received?.content.message;
    const type = received?.content.type;

    console.log(message, type);

    switch (type?.type) {
      case "SEARCH":
        let searchSong: string = message;
        // const list = (await searchTracklist(searchSong)) ?? [];
        // sendSuperUserMessage({
        //   user: "SUPER",
        //   message: list,
        //   type: {
        //     event: "CHANGE",
        //     type: "SEARCH",
        //   },
        // });
        break;

      case "EXPRESSION":
        let experssion: IControllerChange = message.value;
        engine?.instrumental?.setExpression(
          experssion.channel,
          experssion.controllerValue,
          experssion.channel
        );
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

      case "MUTE_VOCAL":
        let muteControllerChange = message as IControllerChange<boolean>;
        console.log("muteControllerChange", muteControllerChange);
        engine?.setMute?.({
          channel: muteControllerChange.channel,
          controllerValue: muteControllerChange.controllerValue,
          controllerNumber: MAIN_VOLUME,
        });
        break;

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

      // case "SET_SONG":
      //   let song: SearchResult = message;
      //   if (song) {
      //     addQueue(song);
      //   }
      //   break;

      case "INIT_REMOTE":
        const expression = engine?.instrumental?.expression;
        if (expression) {
          sendSuperUserMessage({
            user: "SUPER",
            message: expression.map((v) => v.value),
            type: {
              event: "CHANGE",
              type: "INIT_REMOTE_RETURN",
            },
          });
        }
        break;

      case "QUEUE":
        sendSuperUserMessage({
          user: "SUPER",
          message: queue,
          type: {
            event: "CHANGE",
            type: "QUEUE_LIST",
          },
        });
        break;

      // case "QUEUE_MOVE":
      //   let newQueue: SearchResult[] = message as SearchResult[];
      //   moveQueue(newQueue);
      //   break;

      case "NEXT_SONG":
        nextMusic();

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
