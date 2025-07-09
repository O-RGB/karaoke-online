import useMixerStoreNew from "@/features/player/event-player/modules/event-mixer-store";
import useQueuePlayer from "@/features/player/player/modules/queue-player";
import useSongsStore from "@/features/songs/store/songs.store";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { usePeerHostStore } from "@/features/remote/store/peer-js-store";
import { RemoteReceivedMessages } from "@/features/remote/types/remote.type";
import React, { useEffect } from "react";

interface RemoteEventProps {}

const RemoteEvent: React.FC<RemoteEventProps> = ({}) => {
  const received = usePeerHostStore((state) => state.received);
  const sendMessage = usePeerHostStore((state) => state.sendMessage);

  const songsManager = useSongsStore((state) => state.songsManager);
  const engine = useSynthesizerEngine((state) => state.engine);
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

    // switch (type?.type) {
    //   case "SEARCH":
    //     let searchSong: string = message;
    //     const list = songsManager?.manager?.search(searchSong);
    //     sendSuperUserMessage({
    //       user: "SUPER",
    //       message: list,
    //       type: {
    //         event: "CHANGE",
    //         type: "SEARCH",
    //       },
    //     });
    //     break;

    //   case "EXPRESSION":
    //     let experssion: IControllerChange = message.value;
    //     engine?.instrumental?.setExpression(
    //       experssion.channel,
    //       experssion.controllerValue,
    //       experssion.channel
    //     );
    //     break;

    //   case "MUTE_VOCAL":
    //     let muteControllerChange = message as IControllerChange<boolean>;
    //     engine?.setMute?.({
    //       channel: muteControllerChange.channel,
    //       controllerValue: muteControllerChange.controllerValue,
    //       controllerNumber: MAIN_VOLUME,
    //     });
    //     break;

    //   case "INSTALL_REMOTE":
    //     const expression = engine?.instrumental?.expression;
    //     if (expression) {
    //       sendSuperUserMessage({
    //         user: "SUPER",
    //         message: expression.map((v) => v.value),
    //         type: {
    //           event: "CHANGE",
    //           type: "INSTALL_REMOTE_STATUS",
    //         },
    //       });
    //     }
    //     break;

    //   case "QUEUE":
    //     sendSuperUserMessage({
    //       user: "SUPER",
    //       message: queue,
    //       type: {
    //         event: "CHANGE",
    //         type: "QUEUE_LIST",
    //       },
    //     });
    //     break;

    //   case "NEXT_SONG":
    //     nextMusic();

    //   default:
    //     break;
    // }
  };

  useEffect(() => {
    if (engine) {
      remoteTypeHandle(received);
    }
  }, [received, engine]);
  return <></>;
};

export default RemoteEvent;
