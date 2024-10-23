import React, { useEffect, useState } from "react";
import SearchSelect from "../../common/input-data/select/search-select";
import { toOptions } from "@/lib/general";
import { FaUser } from "react-icons/fa";
import { useOrientation } from "@/hooks/orientation-hook";
import SearchDropdown from "./search-dropdown";
import { useKeyboardEvents } from "@/hooks/keyboard-hook";
import useMixerStore from "@/stores/mixer-store";
import useTracklistStore from "@/stores/tracklist-store";
import Tags from "@/components/common/tags";

interface SearchSongProps {
  onClickSong?: (value: SearchResult) => void;
}

const SearchSong: React.FC<SearchSongProps> = ({ onClickSong }) => {
  const searchTracklist = useTracklistStore((state) => state.searchTracklist);
  const { orientation } = useOrientation();
  const hideMixer = useMixerStore((state) => state.hideMixer);

  const {
    searching,
    onEnter,
    arrowRight,
    arrowLeft,
    queueing,
    resetQueueingTimeout,
  } = useKeyboardEvents();

  const [fullUi, setFullUi] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<IOptions<SearchResult>[]>(
    []
  );
  const [indexSelect, setIndexSelect] = useState<number>(0);

  async function onSearch<T = any>(value: string) {
    const se = (await searchTracklist(value)) ?? [];
    const op = toOptions<SearchResult>({
      render: (value) => <SearchDropdown value={value}></SearchDropdown>,
      list: se,
    });
    return op as T;
  }

  const onKeyUpSearch = async (value: string) => {
    const options = await onSearch<IOptions<SearchResult>[]>(value);
    setSearchResult(options);
  };

  const handleSearchFocus = () => {
    setFullUi(true);
  };

  const handleSearchBlur = () => {
    setFullUi(false);
  };

  useEffect(() => {
    resetQueueingTimeout(0);
    if (searching !== "") {
      onKeyUpSearch(searching);
    }
    setIndexSelect(0);
  }, [searching]);

  useEffect(() => {
    if (searchResult.length > 0 && queueing === false) {
      let option = searchResult[indexSelect].option;
      if (option) {
        onClickSong?.(option);
        setIndexSelect(0);
        setSearchResult([]);
      }
    }
  }, [queueing ? undefined : onEnter]);

  useEffect(() => {
    setIndexSelect((value) => {
      let sum = value + 1;
      if (sum <= searchResult.length - 1) {
        return sum;
      }
      return value;
    });
  }, [arrowRight]);
  useEffect(() => {
    setIndexSelect((value) => {
      let sum = value - 1;
      if (sum >= 0) {
        return sum;
      }
      return value;
    });
  }, [arrowLeft]);

  function ArtistRender({
    artist = "",
    className,
  }: {
    artist?: string;
    className?: string;
  }) {
    return (
      <div
        className={`flex gap-2 items-center bg-white/20 rounded-md p-1 px-1.5 ${className}`}
      >
        <span className="pt-1">
          <FaUser className="text-white text-lg"></FaUser>
        </span>
        <span>{artist}</span>
      </div>
    );
  }

  function GetFromType({ from }: { from?: TracklistFrom }) {
    if (from) {
      if (from === "EXTHEME")
        return (
          <Tags color="white" className="!border-none w-[37px] h-[37px]">
            <img src="/icon/ke.ico" alt="" className="w-full h-full" />
          </Tags>
        );
      else if (from === "DRIVE") {
        return (
          <Tags
            color="white"
            className="!border-none w-[37px] h-[37px] flex items-center justify-center"
          >
            <img src="/icon/gd.ico" alt="" className="w-full h-full" />
          </Tags>
        );
      } else if (from === "CUSTOM") {
        return (
          <Tags
            color="white"
            className="!border-none w-[37px] h-[37px] flex items-center justify-center"
          >
            <FaUser className="text-green-500 text-2xl"></FaUser>
          </Tags>
        );
      }
    }
    return <></>;
  }
  if (queueing) {
    return <></>;
  }

  return (
    <div>
      {/* // Default UI */}
      {searching.length > 0 && (
        <div
          className={`${
            hideMixer ? "top-[100px]" : "top-56"
          } fixed hidden lg:block text-white w-full px-5 duration-300`}
        >
          <div className="w-full h-full blur-overlay flex gap-2 blur-border border rounded-md p-2">
            <div className="p-2 bg-white/20 w-[256px] overflow-hidden rounded-md flex-none">
              <span className="text-2xl flex items-center h-full">
                {searching}
              </span>
            </div>

            {searchResult.length > 0 && (
              <div className="flex flex-wrap gap-3 items-center text-2xl duration-300 transition-all ">
                {searchResult[indexSelect].option?.type === 0 && (
                  <Tags color="red" className="!text-lg">
                    EMK
                  </Tags>
                )}
                {searchResult[indexSelect].option?.type === 1 && (
                  <Tags color="green" className="!text-lg">
                    NCN
                  </Tags>
                )}

                <GetFromType
                  from={searchResult[indexSelect].option?.from}
                ></GetFromType>

                <span className="uppercase">
                  {searchResult[indexSelect].option?.id}{" "}
                </span>

                <span className="">
                  {searchResult[indexSelect].option?.name}{" "}
                </span>
                <ArtistRender
                  artist={searchResult[indexSelect].option?.artist}
                ></ArtistRender>
              </div>
            )}
          </div>
        </div>
      )}

      {/* // Mobile UI */}
      <div
        className={`fixed z-50 px-5 block lg:hidden ${
          orientation === "landscape"
            ? `right-0 top-4 lg:top-4 ${fullUi ? "w-full" : "w-40"}`
            : "left-0 top-4 lg:top-4 w-full"
        } duration-300`}
      >
        <div className="w-full blur-overlay flex flex-col rounded-md overflow-hidden">
          <SearchSelect
            border="blur-border border"
            onBlur={handleSearchBlur}
            onFocus={handleSearchFocus}
            className={
              "!placeholder-white appearance-none !bg-transparent w-full"
            }
            onSelectItem={(value: IOptions<SearchResult>) => {
              if (value.option) {
                onClickSong?.(value.option);
              }
            }}
            onSearch={onSearch}
          ></SearchSelect>
        </div>
      </div>
    </div>
  );
};

export default SearchSong;
