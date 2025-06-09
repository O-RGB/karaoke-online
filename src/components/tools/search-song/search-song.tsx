import SearchSelect from "../../common/input-data/select/search-select";
import SearchDropdown from "./search-dropdown";
import useKeyboardStore from "@/features/keyboard-state";
import useQueuePlayer from "@/features/player/player/modules/queue-player";
import SwitchButton from "@/components/common/input-data/switch/switch-button";
import KaraokeSearchInput from "@/components/common/input-data/karaoke-input";
import React, { useState } from "react";
import { toOptions } from "@/lib/general";
import { FaList } from "react-icons/fa";
import { useOrientation } from "@/hooks/orientation-hook";
import { usePeerStore } from "@/features/remote/modules/peer-js-store";
import { ITrackData } from "@/features/songs/types/songs.type";
import useSongsStore from "@/features/songs/store/songs.store";

interface SearchSongProps {}

const SearchSong: React.FC<SearchSongProps> = ({}) => {
  const songsManager = useSongsStore((state) => state.songsManager);
  // const searchTracklist = useTracklistStore((state) => state.searchTracklist);
  const { orientation } = useOrientation();

  const addQueue = useQueuePlayer((state) => state.addQueue);
  const setQueueOpen = useKeyboardStore((state) => state.setQueueOpen);
  const resetQueueingTimeout = useKeyboardStore(
    (state) => state.resetQueueingTimeout
  );

  const superUserConnections = usePeerStore(
    (state) => state.superUserConnections
  );
  const sendSuperUserMessage = usePeerStore(
    (state) => state.sendSuperUserMessage
  );

  const queueing = useKeyboardStore((state) => state.queueing);
  const searching = useKeyboardStore((state) => state.searching);

  const [fullUi, setFullUi] = useState<boolean>(false);

  async function onSearch<T = any>(value: string) {
    const se = await songsManager?.manager?.search(value);
    const op = toOptions<ITrackData>({
      render: (value) => <SearchDropdown value={value}></SearchDropdown>,
      list: se?.records ?? [],
    });
    return op as T;
  }

  const handleSearchFocus = () => {
    setFullUi(true);
  };

  const handleSearchBlur = () => {
    setFullUi(false);
  };

  const setSongPlayer = async (value: ITrackData) => {
    addQueue(value);
  };

  if (queueing) {
    return <></>;
  }

  return (
    <div>
      {/* // Default UI */}

      <KaraokeSearchInput
        onSearch={onSearch}
        onSelectSong={setSongPlayer}
      ></KaraokeSearchInput>

      {/* // Mobile UI */}
      <div
        className={`fixed z-50 px-5 block lg:hidden ${
          orientation === "landscape"
            ? `right-0 top-4 lg:top-4 ${fullUi ? "w-full" : "w-56"}`
            : "left-0 top-4 lg:top-4 w-full"
        } duration-300`}
      >
        <div className="flex gap-1.5 w-full">
          <div className="w-full blur-overlay flex flex-col rounded-md overflow-hidden">
            <SearchSelect
              border="blur-border border"
              onBlur={handleSearchBlur}
              onFocus={handleSearchFocus}
              className={
                "!placeholder-white appearance-none !bg-transparent w-full"
              }
              onSelectItem={(value: IOptions<ITrackData>) => {
                if (value.option) {
                  setSongPlayer(value.option);
                }
              }}
              onSearch={onSearch}
            ></SearchSelect>
          </div>
          <div>
            <SwitchButton
              className="!w-12 !h-9 block lg:hidden"
              onChange={(muted) => {
                setQueueOpen?.();
                resetQueueingTimeout(5000);
              }}
              iconOpen={<FaList></FaList>}
              iconClose={<FaList></FaList>}
            ></SwitchButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSong;
