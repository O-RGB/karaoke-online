import React, { useEffect, useState } from "react";
import SearchSelect from "../../common/input-data/select/search-select";
import { toOptions } from "@/lib/general";
import { FaUser } from "react-icons/fa";
import { useOrientation } from "@/hooks/orientation-hook";
import SearchDropdown from "./search-dropdown";
import useTracklistStore from "@/stores/tracklist-store";
import Tags from "@/components/common/display/tags";
import useKeyboardStore from "@/stores/keyboard-state";
import Button from "@/components/common/button/button";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import { MdPlayCircleFilled } from "react-icons/md";

import useConfigStore from "@/stores/config/config-store";

import useQueuePlayer from "@/stores/player/player/modules/queue-player";
import useMixerStoreNew from "@/stores/player/event-player/modules/event-mixer-store";
import { usePeerStore } from "@/stores/remote/modules/peer-js-store";

interface SearchSongProps {}

const SearchSong: React.FC<SearchSongProps> = ({}) => {
  const config = useConfigStore((state) => state.config);

  const searchTracklist = useTracklistStore((state) => state.searchTracklist);
  const { orientation } = useOrientation();
  const hideMixer = useMixerStoreNew((state) => state.hideMixer);

  const addQueue = useQueuePlayer((state) => state.addQueue);

  const superUserConnections = usePeerStore(
    (state) => state.superUserConnections
  );
  const sendSuperUserMessage = usePeerStore(
    (state) => state.sendSuperUserMessage
  );

  const queueing = useKeyboardStore((state) => state.queueing);
  const searching = useKeyboardStore((state) => state.searching);
  const arrowRight = useKeyboardStore((state) => state.arrowRight);
  const arrowLeft = useKeyboardStore((state) => state.arrowLeft);
  const onEnter = useKeyboardStore((state) => state.onEnter);
  const resetSearchingTimeout = useKeyboardStore(
    (state) => state.resetSearchingTimeout
  );

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

  const setSongPlayer = async (value: SearchResult) => {
    addQueue(value);

    // if (superUserConnections.length > 0) {
    //   sendSuperUserMessage({
    //     message: "",
    //     type: "SONG_INFO_PLAYING",
    //     user: "SUPER",
    //     clientId: superUserConnections[0].connectionId,
    //   });
    // }
  };

  useEffect(() => {
    if (searching !== "") {
      onKeyUpSearch(searching);
      resetSearchingTimeout(5000);
    } else {
      setSearchResult([]);
      resetSearchingTimeout(0);
    }
    setIndexSelect(0);
  }, [searching]);

  const onEnterSong = () => {
    if (searchResult.length > 0 && queueing === false) {
      let option = searchResult[indexSelect].option;
      if (option) {
        setSongPlayer(option);
        setIndexSelect(0);
        setSearchResult([]);
        resetSearchingTimeout(0);
      }
    }
  };

  const onArrowRight = () => {
    setIndexSelect((value) => {
      let sum = value + 1;
      if (sum <= searchResult.length - 1) {
        return sum;
      }
      return value;
    });
    resetSearchingTimeout(5000);
  };

  const onArrowLeft = () => {
    setIndexSelect((value) => {
      let sum = value - 1;
      if (sum >= 0) {
        return sum;
      }
      return value;
    });
    resetSearchingTimeout(5000);
  };

  useEffect(() => {
    onEnterSong();
  }, [onEnter]);

  useEffect(() => {
    onArrowRight();
  }, [arrowRight]);

  useEffect(() => {
    onArrowLeft();
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
          <span className="relative">
            <Tags
              color="white"
              className="!border-none w-[37px] h-[37px] flex items-center justify-center relative"
            >
              <span className="absolute -bottom-1 -left-1 p-1 bg-white rounded-full flex items-center justify-center">
                <FaUser className=" text-green-500"></FaUser>
              </span>
              <img src="/icon/gd.ico" alt="" className="w-full h-full" />
            </Tags>
          </span>
        );
      } else if (from === "DRIVE_EXTHEME") {
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
            hideMixer ? "top-[130px]" : "top-[254px]"
          } fixed hidden lg:block text-white w-full px-5 duration-300`}
        >
          <div className="pb-2 flex gap-2">
            <Button
              disabled={indexSelect === 0}
              onClick={onArrowLeft}
              icon={<IoMdArrowDropleft className="text-lg"></IoMdArrowDropleft>}
              iconPosition="left"
              className="h-7"
              padding="px-2"
            >
              ย้อนกลับ
            </Button>
            <Button
              // disabled={indexSelect > searching.length - 1}
              onClick={onArrowRight}
              icon={
                <IoMdArrowDropright className="text-lg"></IoMdArrowDropright>
              }
              iconPosition="right"
              className="h-7"
              padding="px-2"
            >
              ต่อไป
            </Button>
            <Button
              onClick={onEnterSong}
              icon={
                <MdPlayCircleFilled className="text-lg"></MdPlayCircleFilled>
              }
              iconPosition="right"
              className="h-7"
              padding="px-2"
            >
              เล่น
            </Button>
          </div>
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
                setSongPlayer(value.option);
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
