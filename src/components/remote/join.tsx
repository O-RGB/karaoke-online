import React, { useEffect, useState } from "react";
import Button from "../common/button/button";
import { useRemote } from "@/app/hooks/peer-hooks";
import VolumePanel from "../tools/volume-panel";
import { useMixer } from "@/app/hooks/mixer-hooks";
import { TbNote } from "react-icons/tb";

interface JoinConnectProps {
  hostId: string;
}

const JoinConnect: React.FC<JoinConnectProps> = ({ hostId }) => {
  const { normalPeer, connectToPeer, sendMessage, messages } = useRemote();
  const [message, setMessage] = useState("");
  const [gainNode, setGainNode] = useState<SearchResult[]>([]);

  const handleConnect = () => {
    if (hostId) {
      connectToPeer(hostId, false);
    }
  };

  const handleSendMessage = (str: string) => {
    if (sendMessage) {
      sendMessage(str, "SEARCH_SONG");
      setMessage("");
    }
  };

  const handleSetSong = (value: SearchResult) => {
    if (sendMessage) {
      sendMessage(value, "SET_SONG");
      setMessage("");
    }
  };

  useEffect(() => {
    handleConnect();
  }, [normalPeer]);

  useEffect(() => {
    if (messages?.content.type === "SEND_SONG_LIST") {
      setGainNode(messages?.content.data);
    }
  }, [messages?.content]);

  if (!normalPeer.id) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-lg">
        กำลังเชื่อมต่อ...
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <input
        type="text"
        className="w-full p-2 border rounded"
        onChange={(e) => handleSendMessage(e.target.value)}
        placeholder="ค้นหาเพลง"
      />
      <div className="pt-1">
        {gainNode.map((data, index) => {
          return (
            <div
              onClick={() => {
                handleSetSong(data);
              }}
              className="p-2 border bg-slate-200 hover:bg-slate-400 duration-300 flex items-center  gap-2 cursor-pointer"
              key={`song-list-${index}`}
            >
              <TbNote></TbNote>
              {data.name} - {data.artist}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JoinConnect;
