"use client";
import React, { useEffect, useState } from "react";
import { useRemote } from "@/hooks/peer-hook";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import SearchSelect from "../common/input-data/select/search-select";
import { toOptions } from "@/lib/general";
import { SONG_TYPE } from "@/config/value";
import { onSearchList } from "@/lib/trie-search";
import SearchDropdown from "../tools/search-song/search-dropdown";
import { usePeerStore } from "@/stores/peer-store";

interface JoinConnectProps {
  hostId: string;
}

const JoinConnect: React.FC<JoinConnectProps> = ({ hostId }) => {
  const {
    initializePeers,
    normalPeer,
    connectToPeer,
    sendMessage,
    received: messages,
    connections,
  } = usePeerStore();
  const [songList, setSongList] = useState<SearchResult[]>([]);

  const handleConnect = () => {
    if (hostId) {
      connectToPeer(hostId, false);
    }
  };

  const handleSendMessage = (str: string) => {
    if (sendMessage && str.length > 0) {
      sendMessage({
        message: str,
        type: "SEARCH_SONG",
        user: "NORMAL",
        clientId: normalPeer?.id,
      });
      // sendMessage(str, "SEARCH_SONG", "NORMAL");
    }
  };

  const handleSetSong = (value: SearchResult) => {
    if (sendMessage) {
      sendMessage({
        message: value,
        type: "SET_SONG",
        user: "NORMAL",
        clientId: normalPeer?.id,
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
    initializePeers(false);
  }, []);

  useEffect(() => {
    handleConnect();
  }, [normalPeer]);

  useEffect(() => {
    const type = messages?.content.type;
    const data = messages?.content.message;
    if (type === "SEND_SONG_LIST") {
      setSongList(data);
    }
  }, [messages?.content]);

  if (!normalPeer?.id) {
    return (
      <div className="bg-slate-700 min-h-dvh flex items-center justify-center text-lg text-white">
        <div className="flex items-center gap-2 font-bold">
          <AiOutlineLoading3Quarters className="text-lg animate-spin"></AiOutlineLoading3Quarters>
          กำลังเชื่อมต่อ...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-700 min-h-screen">
      <div className="pt-1">
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
      </div>
    </div>
  );
};

export default JoinConnect;
