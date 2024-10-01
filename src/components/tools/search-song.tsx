import { onSearchList } from "@/lib/trie-search";
import React, { useEffect, useState } from "react";
import TrieSearch from "trie-search";
import SearchSelect from "../common/input-data/select/search-select";
import { toOptions } from "@/lib/general";
import { SONG_TYPE } from "@/config/value";
import { useKeyUp } from "@/hooks/keyup-hook";
import { useAppControl } from "@/hooks/app-control-hook";
import { FaUser } from "react-icons/fa";

interface SearchSongProps {
  tracklist: TrieSearch<SearchResult> | undefined;
  onClickSong?: (value: SearchResult) => void;
}

const SearchSong: React.FC<SearchSongProps> = ({ tracklist, onClickSong }) => {
  const { searching, onEnter, arrowRight, arrowLeft } = useKeyUp();
  const { hideVolume } = useAppControl();

  const [searchResult, setSearchResult] = useState<IOptions<SearchResult>[]>(
    []
  );
  const [indexSelect, setIndexSelect] = useState<number>(0);

  async function onSearch<T = any>(value: string) {
    if (tracklist) {
      const se = await onSearchList<SearchResult>(value, tracklist);
      const op = toOptions<SearchResult>({
        render: (value) => (
          <div className="flex justify-between w-full gap-4">
            <span className="flex flex-col md:flex-row gap-2 md:items-center justify-between ">
              <span className="text-lg">{value.name}</span>
              <span className="flex gap-1 items-center text-sm p-1 px-1.5 bg-white/20 rounded-md w-fit">
                <span>
                  <FaUser className="text-xs"></FaUser>
                </span>
                <span>{value.artist}</span>
              </span>
            </span>
            <span className="rounded-md">
              {value.type === 0 && (
                <span className="text-sm font-bold p-1  rounded-md bg-red-500/80">
                  EMK
                </span>
              )}
              {value.type === 1 && (
                <span className="text-sm font-bold p-1  rounded-md bg-green-500/80">
                  NCN
                </span>
              )}
            </span>
          </div>
        ),
        list: se,
      });
      return op as T;
    }
    return [] as T;
  }

  const onKeyUpSearch = async (value: string) => {
    const options = await onSearch<IOptions<SearchResult>[]>(value);
    setSearchResult(options);
  };
  useEffect(() => {
    if (searching !== "") {
      onKeyUpSearch(searching);
    }
    setIndexSelect(0);
  }, [searching]);

  useEffect(() => {
    if (searchResult.length > 0) {
      let option = searchResult[indexSelect].option;
      if (option) {
        onClickSong?.(option);
        setIndexSelect(0);
        setSearchResult([]);
      }
    }
  }, [onEnter]);

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

  return (
    <div>
      {searching.length > 0 && (
        <div
          className={`${
            hideVolume ? "top-[100px]" : "top-56"
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
                  <span className="text-lg font-bold p-1  rounded-md bg-red-500/80">
                    EMK
                  </span>
                )}
                {searchResult[indexSelect].option?.type === 1 && (
                  <span className="text-lg font-bold p-1  rounded-md bg-green-500/80">
                    NCN
                  </span>
                )}
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
      <div className="fixed z-50 left-0 top-4 lg:top-4 px-5 w-full block lg:hidden">
        <div className="w-full blur-overlay flex flex-col rounded-md overflow-hidden">
          <SearchSelect
            className={"!placeholder-white appearance-none !bg-transparent"}
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
