import volumeSynth from "@/features/volume/volume-features";
import useConfigStore from "@/stores/config/config-store";
import { usePeerStore } from "@/stores/peer-store";
import useQueuePlayer from "@/stores/player/update/modules/queue-player";
import { useSpessasynthStore } from "@/stores/spessasynth-store";
import useTracklistStore from "@/stores/tracklist-store";
import React, { useEffect } from "react";

interface RemoteRenderProps {}

const RemoteRender: React.FC<RemoteRenderProps> = ({}) => {
  const sendMessage = usePeerStore((state) => state.sendMessage);
  const received = usePeerStore((state) => state.received);
  const synth = useSpessasynthStore((state) => state.synth);
  const searchTracklist = useTracklistStore((state) => state.searchTracklist);
  const volumeLib = synth ? volumeSynth(synth) : undefined;
  const { sendSuperUserMessage, superUserConnections } = usePeerStore();

  const queue = useQueuePlayer((state) => state.queue);
  const addQueue = useQueuePlayer((state) => state.addQueue);
  const nextMusic = useQueuePlayer((state) => state.nextMusic);
  // const playingQueue = usePlayer((state) => state.playingQueue);
  // const setSongPlaying = usePlayer((state) => state.setSongPlaying);
  // const loadAndPlaySong = usePlayer((state) => state.loadAndPlaySong);
  // const nextSong = usePlayer((state) => state.nextSong);
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

      case "SET_CHANNEL":
        let vol = data as ISetChannelGain;
        volumeLib?.updateMainVolume(vol.channel, vol.value);
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
        if (song) {
          addQueue(song);
          // const data = await loadAndPlaySong(song, config.system);
          // if (data) {
          //   if (data.length <= 1) {
          //     const { file, songInfo } = data[0];
          //     setSongPlaying(file, songInfo);
          //   }
          // }
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
