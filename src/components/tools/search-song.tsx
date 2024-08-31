import { onSearchList } from "@/lib/trie-search";
import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import TrieSearch from "trie-search";
import Input from "../common/input";

interface SearchSongProps {
  tracklist: TrieSearch<SearchResult> | undefined;
  onClickSong?: (value: SearchResult) => void;
}

const SearchSong: React.FC<SearchSongProps> = ({ tracklist, onClickSong }) => {
  const [searchResult, setSearchResult] = useState<SearchResult[]>([]);
  const [value, setValue] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setSearchResult([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed z-50 left-0 top-44 px-5 w-full">
      <div className="w-full blur-overlay flex flex-col">
        <Input
          style={{
            backgroundColor: "transparent",
          }}
          value={value}
          placeholder="ค้นหาเพลง"
          onChange={async (e) => {
            if (tracklist) {
              const value = e.target.value;
              setValue(value);
              const se = await onSearchList<SearchResult>(value, tracklist);
              setSearchResult(se);
            }
          }}
        />
        <div
          ref={dropdownRef}
          className={`border divide-y divide-white/30 text-white rounded-md ${
            searchResult.length > 0
              ? "max-h-[245px]"
              : "max-h-0 border-transparent"
          } duration-300 overflow-auto`}
        >
          {searchResult.map((data, index) => {
            return (
              <div
                onClick={() => {
                  onClickSong?.(data);
                  setSearchResult([]);
                  setValue("");
                }}
                key={`search-result-${index}`}
                className="flex items-center gap-2 p-2 hover:bg-white/30 cursor-pointer duration-300"
              >
                <FaSearch className="text-sm"></FaSearch>
                <span>
                  {data.name} - {data.artist}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SearchSong;
