"use client";
import React, { useEffect, useState } from "react";
import { useRemote } from "@/hooks/peer-hook";
import { TbNote } from "react-icons/tb";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaSearch } from "react-icons/fa";
import Select from "../common/input-data/select";
import { toOptions } from "@/lib/general";
import { SONG_TYPE } from "@/config/value";

interface JoinConnectProps {
  hostId: string;
}

const JoinConnect: React.FC<JoinConnectProps> = ({ hostId }) => {
  const { normalPeer, connectToPeer, sendMessage, messages } = useRemote();
  const [songList, setSongList] = useState<SearchResult[]>([]);

  const handleConnect = () => {
    if (hostId) {
      connectToPeer(hostId, false);
    }
  };

  const handleSendMessage = (str: string) => {
    if (sendMessage && str.length > 0) {
      sendMessage(str, "SEARCH_SONG");
    }
  };

  const handleSetSong = (value: SearchResult) => {
    if (sendMessage) {
      sendMessage(value, "SET_SONG");
    }
  };

  useEffect(() => {
    handleConnect();
  }, [normalPeer]);

  useEffect(() => {
    const type = messages?.content.type;
    const data = messages?.content.data;
    if (type === "SEND_SONG_LIST") {
      setSongList(data);
    }
  }, [messages?.content]);

  if (!normalPeer.id) {
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
      {/* <input
        type="text"
        className="w-full p-2 border rounded"
        onChange={(e) => handleSendMessage(e.target.value)}
        placeholder="ค้นหาเพลง"
      /> */}
      <div className="pt-1">
        <Select
          className={"!placeholder-white"}
          onSelectItem={(value: IOptions<SearchResult>) => {
            if (value.option) {
              handleSetSong?.(value.option);
            }
          }}
          onChange={(e) => handleSendMessage(e.target.value)}
          onSearch={async (value) => {
            handleSendMessage(value);
            if (songList) {
              const op = toOptions<SearchResult>({
                render: (value) => (
                  <div className="flex justify-between w-full">
                    <span>
                      {value.name} - {value.artist}
                    </span>
                    <span className=" rounded-md">
                      {SONG_TYPE[value.type as 0 | 1]}
                    </span>
                  </div>
                ),
                list: songList,
              });
              return op;
            }
            return [];
          }}
        ></Select>
      </div>
    </div>
  );
};

export default JoinConnect;
