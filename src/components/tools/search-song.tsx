import { onSearchList } from "@/lib/trie-search";
import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import TrieSearch from "trie-search";

interface SearchSongProps {
  songList: TrieSearch<SearchResult> | undefined;
  onClickSong?: (value: SearchResult) => void;
}

const SearchSong: React.FC<SearchSongProps> = ({ songList, onClickSong }) => {
  const [searchResult, setSearchResult] = useState<SearchResult[]>([]);
  return (
    <>
      <div className="w-full p-2 bg-white flex flex-col">
        <label htmlFor="" className="text-sm text-gray-500">
          Search Song:
        </label>
        <input
          className="border"
          type="text"
          onChange={async (e) => {
            if (songList) {
              const value = e.target.value;
              const se = await onSearchList<SearchResult>(value, songList);
              setSearchResult(se);
            }
          }}
        />
        {searchResult.map((data, index) => {
          return (
            <div
              onClick={() => {
                onClickSong?.(data);
              }}
              key={`search-result-${index}`}
              className="flex gap-1"
            >
              <FaSearch className="text-lg"></FaSearch>
              <span>
                {data.name} - {data.artist}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default SearchSong;
