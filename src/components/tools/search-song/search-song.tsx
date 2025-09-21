import SearchSelect from "../../common/input-data/select/search-select";
import SearchDropdown from "./search-dropdown";
import useKeyboardStore from "@/features/keyboard-state";
import SwitchButton from "@/components/common/input-data/switch/switch-button";
import KaraokeSearchInput from "@/components/common/input-data/karaoke-input";
import React, { useState } from "react";
import useSongsStore from "@/features/songs/store/songs.store";
import useQueuePlayer from "@/features/player/player/modules/queue-player";
import { toOptions } from "@/lib/general";
import { FaList } from "react-icons/fa";
import { useOrientation } from "@/hooks/orientation-hook";
import { ITrackData } from "@/features/songs/types/songs.type";

interface SearchSongProps {}

const SearchSong: React.FC<SearchSongProps> = ({}) => {
  const songsManager = useSongsStore((state) => state.songsManager);
  const { orientation } = useOrientation();

  const addQueue = useQueuePlayer((state) => state.addQueue);
  const setQueueOpen = useKeyboardStore((state) => state.setQueueOpen);
  const resetQueueingTimeout = useKeyboardStore(
    (state) => state.resetQueueingTimeout
  );

  const queueing = useKeyboardStore((state) => state.queueing);
  const [fullUi, setFullUi] = useState<boolean>(false);

  async function onSearch<T = any>(value: string) {
    const se = (await songsManager?.onSearch(value)) ?? [];
    const op = toOptions<ITrackData>({
      render: (value) => <SearchDropdown value={value}></SearchDropdown>,
      list: se,
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

  const isLandscape = orientation === "landscape";

  return (
    <div>
      <KaraokeSearchInput
        onSearch={onSearch}
        onSelectSong={setSongPlayer}
      ></KaraokeSearchInput>

      <div
        style={{
          ...(isLandscape &&
            !fullUi && {
              right: "max(1rem, env(safe-area-inset-right))",
              width: "14rem",
            }),
          ...(isLandscape &&
            fullUi && {
              left: "max(1rem, env(safe-area-inset-left))",
              right: "max(1rem, env(safe-area-inset-right))",
              width: "auto",
            }),
          top: isLandscape ? "max(1rem, env(safe-area-inset-top))" : undefined,
        }}
        className={`z-50 block lg:hidden ${isLandscape ? `fixed` : "w-full"}`}
      >
        <div className="flex gap-1.5 w-full">
          <div
            className={`w-full blur-overlay flex flex-col rounded-md overflow-hidden transition-all duration-300 ${
              isLandscape && fullUi ? "transform scale-x-100" : ""
            }`}
          >
            <SearchSelect
              onBlur={handleSearchBlur}
              onFocus={handleSearchFocus}
              className={
                "!placeholder-white !bg-transparent w-full !text-white font-light"
              }
              onSelectItem={(value: IOptions<ITrackData>) => {
                if (value.option) {
                  setSongPlayer(value.option);
                }
              }}
              onSearch={onSearch}
            ></SearchSelect>
          </div>
          <div className="flex-shrink-0">
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
