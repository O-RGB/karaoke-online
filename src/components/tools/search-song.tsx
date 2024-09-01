import { onSearchList } from "@/lib/trie-search";
import React from "react";
import TrieSearch from "trie-search";
import Select from "../common/input-data/select";
import { toOptions } from "@/lib/general";
import { SONG_TYPE } from "@/config/value";

interface SearchSongProps {
  tracklist: TrieSearch<SearchResult> | undefined;
  onClickSong?: (value: SearchResult) => void;
}

const SearchSong: React.FC<SearchSongProps> = ({ tracklist, onClickSong }) => {
  return (
    <div className="fixed z-50 left-0 top-4 lg:top-[10.3rem] px-5 w-full">
      <div className="w-full blur-overlay flex flex-col">
        <Select
          onSelectItem={(value: IOptions<SearchResult>) => {
            if (value.option) {
              onClickSong?.(value.option);
            }
          }}
          onSearch={async (value) => {
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
              return op;
            }
            return [];
          }}
        ></Select>
      </div>
    </div>
  );
};

export default SearchSong;
