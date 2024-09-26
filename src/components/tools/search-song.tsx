import { onSearchList } from "@/lib/trie-search";
import React, { useEffect, useState } from "react";
import TrieSearch from "trie-search";
import Select from "../common/input-data/select";
import { toOptions } from "@/lib/general";
import { SONG_TYPE } from "@/config/value";
import { useKeyUp } from "@/hooks/keyup-hook";

interface SearchSongProps {
  tracklist: TrieSearch<SearchResult> | undefined;
  onClickSong?: (value: SearchResult) => void;
}

const SearchSong: React.FC<SearchSongProps> = ({ tracklist, onClickSong }) => {
  const { searching, onEnter, arrowRight, arrowLeft } = useKeyUp();

  const [searchResult, setSearchResult] = useState<IOptions<SearchResult>[]>(
    []
  );
  const [indexSelect, setIndexSelect] = useState<number>(0);

  async function onSearch<T = any>(value: string) {
    if (tracklist) {
      const se = await onSearchList<SearchResult>(value, tracklist);
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

  return (
    <div>
      {searching.length > 0 && (
        <div className="fixed hidden lg:block text-white top-56 w-full px-5">
          <div className="w-full blur-overlay flex gap-2 blur-border border rounded-md p-2">
            <div className="p-2 bg-white/20 w-64 overflow-hidden rounded-md">
              <span className="text-2xl">{searching}</span>
            </div>
            <div className="text-2xl flex gap-2 items-center">
              {searchResult.length > 0 && (
                <>
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
                  <span>{searchResult[indexSelect].option?.name} </span>
                  <span>-</span>
                  <span> {searchResult[indexSelect].option?.artist}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="fixed z-50 left-0 top-4 lg:top-4 px-5 w-full block lg:hidden">
        <div className="w-full blur-overlay flex flex-col">
          <Select
            className={"!placeholder-white"}
            onSelectItem={(value: IOptions<SearchResult>) => {
              if (value.option) {
                onClickSong?.(value.option);
              }
            }}
            onSearch={onSearch}
          ></Select>
        </div>
      </div>
    </div>
  );
};

export default SearchSong;
