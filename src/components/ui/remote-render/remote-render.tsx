import volumeSynth from "@/features/volume/volume-features";
import { usePeerStore } from "@/stores/peer-store";
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
        // let song = data as SearchResult;
        // if (song) {
        //   loadAndPlaySong(song);
        //   setPlayingTrackFile(song);
        // }
        break;

      case "UPLOAD_SONG":
        console.log("remote...");
        let uploaded = data as SongFiltsEncodeAndDecode;
        if (uploaded) {
          const blob = new Blob([uploaded.mid]);

          const receivedFile = new File([blob], "midi", {
            lastModified: Date.now(),
          });

          let getDecode: SongFilesDecode = {
            cur: uploaded.cur,
            lyr: uploaded.lyr,
            mid: receivedFile,
          };
          //   setSongPlaying(getDecode);
        }

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
