"use client";
import React, { useEffect, useState } from "react";
import { useRemote } from "@/hooks/peer-hook"; // Updated hook
import VolumePanel from "../tools/volume-panel/volume-panel";
import { toOptions } from "@/lib/general";
import { onSearchList } from "@/lib/trie-search";
import SearchDropdown from "../tools/search-song/search-dropdown";
import SearchSelect from "../common/input-data/select/search-select";

interface SuperJoinConnectProps {
  hostId: string;
}

const SuperJoinConnect: React.FC<SuperJoinConnectProps> = ({ hostId }) => {
  const { superUserPeer, connectToPeer, sendSuperUserMessage, received } =
    useRemote();
  const [audioGain, setAudioGain] = useState<number[]>(Array(16).fill(0));
  const [instrument, setInstrument] = useState<number[]>([]);
  const [songList, setSongList] = useState<SearchResult[]>([]);

  const handleConnect = () => {
    if (hostId) {
      connectToPeer(hostId, true);
    }
  };

  const changeVol = (value: ISetChannelGain) => {
    if (sendSuperUserMessage) {
      sendSuperUserMessage({
        message: value,
        type: "SET_CHANNEL",
        user: "SUPER",
        clientId: superUserPeer.id,
      });
    }
  };

  const handleSendMessage = (str: string) => {
    if (sendSuperUserMessage && str.length > 0) {
      sendSuperUserMessage({
        message: str,
        type: "SEARCH_SONG",
        user: "SUPER",
        clientId: superUserPeer.id,
      });
    }
  };

  const handleSetSong = (value: SearchResult) => {
    if (sendSuperUserMessage) {
      sendSuperUserMessage({
        message: value,
        type: "SET_SONG",
        user: "SUPER",
        clientId: superUserPeer.id,
      });
    }
  };

  async function onSearch(value: string) {
    handleSendMessage(value);
    if (songList) {
      const op = toOptions<SearchResult>({
        render: (value) => <SearchDropdown value={value}></SearchDropdown>,
        list: songList,
      });
      return op;
    }
    return [];
  }

  useEffect(() => {
    handleConnect();
  }, [superUserPeer]);

  useEffect(() => {
    if (received) {
      const type = received.content.type;
      const data = received?.content.message;

      if (type === "GIND_NODE") {
        setAudioGain(data);
      } else if (type === "SEND_SONG_LIST") {
        console.log("set song list");
        setSongList(data);
      }
    }
  }, [received?.content]);

  if (!superUserPeer.id) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-lg">
        กำลังเชื่อมต่อ...
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-800 min-h-screen flex flex-col gap-2">
      <SearchSelect
        className={"!placeholder-white"}
        onSelectItem={(value: IOptions<SearchResult>) => {
          if (value.option) {
            handleSetSong?.(value.option);
          }
        }}
        onChange={(e) => handleSendMessage(e.target.value)}
        onSearch={onSearch}
      ></SearchSelect>
      <VolumePanel
        className=" "
        audioGain={audioGain}
        instrument={instrument}
        onVolumeChange={(c, v) => changeVol({ channel: c, value: v })}
      ></VolumePanel>
    </div>
  );
};

export default SuperJoinConnect;
