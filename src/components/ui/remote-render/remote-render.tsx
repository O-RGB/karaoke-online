import volumeSynth from "@/features/volume/volume-features";
import useConfigStore from "@/stores/config/config-store";
import { useSynthesizerEngine } from "@/stores/engine/synth-store";
import {
  IControllerChange,
  ILockController,
} from "@/stores/engine/types/synth.type";

import useMixerStoreNew from "@/stores/player/event-player/modules/event-mixer-store";
import useQueuePlayer from "@/stores/player/player/modules/queue-player";
import { usePeerStore } from "@/stores/remote/modules/peer-js-store";
import { RemoteSendMessage } from "@/stores/remote/types/remote.type";

import useTracklistStore from "@/stores/tracklist-store";
import React, { useEffect } from "react";

interface RemoteRenderProps {}

const RemoteRender: React.FC<RemoteRenderProps> = ({}) => {
  const sendMessage = usePeerStore((state) => state.sendMessage);
  const received = usePeerStore((state) => state.received);
  // const synth = useSpessasynthStore((state) => state.synth);
  const engine = useSynthesizerEngine((state) => state.engine);

  const searchTracklist = useTracklistStore((state) => state.searchTracklist);
  const setVolumes = useMixerStoreNew((state) => state.setVolumes);
  const updatePitch = useMixerStoreNew((state) => state.updatePitch);
  const setMute = useMixerStoreNew((state) => state.setMute);
  const { sendSuperUserMessage, superUserConnections } = usePeerStore();

  const setEventController = useMixerStoreNew(
    (state) => state.setEventController
  );

  const queue = useQueuePlayer((state) => state.queue);
  const addQueue = useQueuePlayer((state) => state.addQueue);
  const nextMusic = useQueuePlayer((state) => state.nextMusic);
  const config = useConfigStore((state) => state.config);

  const eventRemote = async (from?: string, content?: RemoteSendMessage) => {
    const type = content?.type;
    const data = content?.message;
    const user = content?.user;

    if (!type) {
      return;
    }
    switch (type) {
      case "GIND_NODE":
        return data as number[];

      case "REQUEST_QUEUE_LIST":
        sendSuperUserMessage({
          message: queue,
          type: "REQUEST_QUEUE_LIST",
          user: "SUPER",
          clientId: from,
        });
        break;

      case "CONTROLLER":
        sendSuperUserMessage({
          message: queue,
          type: "REQUEST_QUEUE_LIST",
          user: "SUPER",
          clientId: from,
        });
        break;

      case "CONTROLLER_CHANGE":
        let controller = data as IControllerChange;
        console.log(controller)
        setEventController(controller, true);
        break;

      case "CONTROLLER_LOCK":
        let lock = data as ILockController;
        engine?.lockController(
          lock.channel,
          lock.controllerNumber,
          lock.isLocked
        );
        break;

      case "SET_CHANNEL":
        let vol = data as ISetChannelGain;
        console.log("set channel re");
        setVolumes(vol.channel, vol.value, true);
        return data as ISetChannelGain;

      case "PITCH":
        let pitch = data as number;
        updatePitch(null, pitch);
        return data as ISetChannelGain;

      case "MUTE":
        let mute = data as ISetMuteChannel;
        setMute(mute.channel, mute.mute);
        return data as ISetChannelGain;

      case "SEARCH_SONG":
        // if (tracklist !== undefined) {
        let search = data as string;
        let res = await searchTracklist(search);
        if (res) {
          sendMessage({
            message: res,
            type: "SEND_SONG_LIST",
            user: user ?? "NORMAL",
            clientId: from,
          });
        }
        // }
        break;

      case "SET_SONG":
        let song = data as SearchResult;
        console.log(song);
        if (song) {
          addQueue(song);
        }
        break;

      case "NEXT_SONG":
        nextMusic();
        break;

      // case "UPLOAD_SONG":
      //   console.log("remote...");
      //   let uploaded = data as SongFiltsEncodeAndDecode;
      //   if (uploaded) {
      //     const blob = new Blob([uploaded.mid]);

      //     const receivedFile = new File([blob], "midi", {
      //       lastModified: Date.now(),
      //     });

      //     let getDecode: SongFilesDecode = {
      //       cur: uploaded.cur,
      //       lyr: uploaded.lyr,
      //       mid: receivedFile,
      //     };
      //     setSongPlaying(getDecode, {
      //       artist: "-",
      //       fileId: "0000",
      //       from: "CUSTOM",
      //       id: "0000",
      //       name: "เพลงนอกระบบ",
      //       type: 0,
      //     });
      //   }

      default:
        return data;
    }
  };

  useEffect(() => {
    eventRemote(received?.from, received?.content);
  }, [received?.content]);

  return null;
};

export default RemoteRender;
