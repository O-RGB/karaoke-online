"use client";
import React, { useEffect, useState } from "react";
import VolumePanel from "../../tools/volume-panel";
import { toOptions } from "@/lib/general";
import SearchDropdown from "../../tools/search-song/search-dropdown";
import SearchSelect from "../../common/input-data/select/search-select";
import Upload from "../../common/input-data/upload";
import Label from "../../common/display/label";
import { FaRegFileAudio } from "react-icons/fa";
import { readSong } from "@/lib/karaoke/read";
import { usePeerStore } from "@/stores/peer-store";
import useMixerStore from "@/stores/mixer-store";
import EventRenderSuper from "./event-render";
import QueueSong from "@/components/tools/queue-song/queue-song";
import useKeyboardStore from "@/stores/keyboard-state";
import RangeBarClone from "@/components/common/input-data/range-bar-clone";

interface SuperJoinConnectProps {
  hostId: string;
}

const SuperJoinConnect: React.FC<SuperJoinConnectProps> = ({ hostId }) => {
  const superUserPeer = usePeerStore((state) => state.superUserPeer);
  const connectToPeer = usePeerStore((state) => state.connectToPeer);
  const sendSuperUserMessage = usePeerStore(
    (state) => state.sendSuperUserMessage
  );
  const initializePeers = usePeerStore((state) => state.initializePeers);
  const initializeKeyboardListeners = useKeyboardStore(
    (state) => state.initializeKeyboardListeners
  );
  const [searchSongList, setSearchSongList] = useState<SearchResult[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [songPlayingInfo, setSongPlayingInfo] = useState<MidiPlayingInfo>();

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
        clientId: superUserPeer?.id,
      });
    }
  };

  const handleSendMessage = (str: string) => {
    if (sendSuperUserMessage && str.length > 0) {
      sendSuperUserMessage({
        message: str,
        type: "SEARCH_SONG",
        user: "SUPER",
        clientId: superUserPeer?.id,
      });
    }
  };

  const handleSetSong = (value: SearchResult) => {
    if (sendSuperUserMessage) {
      sendSuperUserMessage({
        message: value,
        type: "SET_SONG",
        user: "SUPER",
        clientId: superUserPeer?.id,
      });
    }
  };

  const handleRequestQueue = () => {
    if (sendSuperUserMessage) {
      sendSuperUserMessage({
        message: "",
        type: "REQUEST_QUEUE_LIST",
        user: "SUPER",
        clientId: superUserPeer?.id,
      });
    }
  };

  const handleSetCurrentTime = (value: number) => {
    if (sendSuperUserMessage) {
      sendSuperUserMessage({
        message: value,
        type: "SET_TIME_CHANGE",
        user: "SUPER",
        clientId: superUserPeer?.id,
      });
    }
  };

  const handleUploadFileSong = async (file: File, filelist: FileList) => {
    if (sendSuperUserMessage) {
      const song = await readSong(filelist);
      console.log("song", song);
      if (song.length === 1) {
        sendSuperUserMessage({
          message: song[0],
          type: "UPLOAD_SONG",
          user: "SUPER",
          clientId: superUserPeer?.id,
        });
      }
    }
  };

  async function onSearch(value: string) {
    handleSendMessage(value);
    if (searchSongList) {
      const op = toOptions<SearchResult>({
        render: (value) => <SearchDropdown value={value}></SearchDropdown>,
        list: searchSongList,
      });
      return op;
    }
    return [];
  }

  useEffect(() => {
    initializePeers(true);
    initializeKeyboardListeners();
  }, []);

  useEffect(() => {
    handleConnect();
  }, [superUserPeer]);

  if (!superUserPeer?.id) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-lg">
        กำลังเชื่อมต่อ...
      </div>
    );
  }

  return (
    <>
      <QueueSong></QueueSong>
      <EventRenderSuper
        setSearchSongList={setSearchSongList}
        setCurrentTime={setCurrentTime}
        setSongInfoPlaying={setSongPlayingInfo}
      ></EventRenderSuper>
      <div className="p-4 bg-slate-800 min-h-screen flex flex-col gap-4">
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
          className=" flex flex-col gap-1.5"
          onOpenQueue={handleRequestQueue}
          onVolumeChange={(c, v) => changeVol({ channel: c, value: v })}
        ></VolumePanel>

        <div className="text-white">
          <Label>ส่งไฟล์เพื่อเล่น (.emk หรือ .mid, .cur, .lyr) </Label>
          <Upload
            accept=".emk,application/octet-stream,.cur,application/octet-stream,.lyr,text/plain,.mid,audio/midi"
            className="border p-3 rounded-md hover:bg-gray-50 duration-300 flex justify-between"
            onSelectFile={handleUploadFileSong}
            inputProps={{
              multiple: true,
            }}
          >
            <span className="w-full text-sm flex items-center gap-2">
              <FaRegFileAudio></FaRegFileAudio>
              <span>อัปโหลดไฟล์</span>
            </span>
          </Upload>
        </div>
        {/* <div className="w-full">
          {JSON.stringify(currentTime)}
          <RangeBarClone
            max={songPlayingInfo?.midiInfo.duration}
            value={currentTime}
            onChange={handleSetCurrentTime}
          ></RangeBarClone>
        </div> */}
      </div>
    </>
  );
};

export default SuperJoinConnect;
