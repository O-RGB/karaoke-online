import React, { useEffect, useRef, useState } from "react";
import Button from "../../button/button";
import Tags from "../../display/tags";
import useKeyboardStore from "@/features/keyboard-state";
import { AiFillLike, AiOutlineLoading } from "react-icons/ai";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import { MdPlayCircleFilled } from "react-icons/md";
import { FaPlay, FaPlayCircle, FaUser } from "react-icons/fa";
// import { useKeyboardEvents } from "@/hooks/keyboard-hook";
import { ITrackData } from "@/features/songs/types/songs.type";
import { SourceTag } from "@/components/tools/search-song/source-tag";
import { MusicFileType, MusicSubType } from "@/lib/karaoke/songs/types";
import {
  useKeyboardNavigation,
  useKeyboardSearch,
} from "@/hooks/keyboard-hook";

interface KaraokeSearchInputProps {
  onSearch?: (value: string) => Promise<IOptions[]>;
  onSelectSong?: (song: ITrackData) => void;
}

const ArtistTag = ({ artist = "" }: { artist?: string }) => {
  if (!artist) return null;

  return (
    <div className="flex gap-2 items-center bg-white/20 rounded-md p-1 px-1.5">
      <span className="pt-1">
        <FaUser className="text-white text-lg" />
      </span>
      <span>{artist}</span>
    </div>
  );
};

const SongTypeTag = ({ type }: { type?: MusicSubType }) => {
  if (type === "EMK")
    return (
      <Tags color="red" className="!text-lg">
        EMK
      </Tags>
    );
  if (type === "NCN")
    return (
      <Tags color="green" className="!text-lg">
        NCN
      </Tags>
    );
  if (type === "MID")
    return (
      <Tags color="amber" className="!text-lg">
        MIDX
      </Tags>
    );
  if (type === "MP3")
    return (
      <Tags color="yellow" className="!text-lg">
        MP3
      </Tags>
    );
  if (type === "YOUTUBE")
    return (
      <Tags color="gray" className="!text-lg">
        YOUTUBE
      </Tags>
    );
  return null;
};

const KaraokeSearchInput: React.FC<KaraokeSearchInputProps> = ({
  onSearch,
  onSelectSong,
}) => {
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<IOptions<ITrackData>[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { searching, openSearchBox } = useKeyboardSearch();
  const { onEnter, arrowLeft, arrowRight } = useKeyboardNavigation();
  const resetSearchingTimeout = useKeyboardStore(
    (state) => state.resetSearchingTimeout
  );

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestSearchRef = useRef(searching);

  const selectedSong = searchResult[selectedIndex]?.option;
  const hasResults = searchResult.length > 0;

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResult([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const results = (await onSearch?.(query)) || [];
      setSearchResult(results);
    } finally {
      if (query === latestSearchRef.current) {
        setLoading(false);
      }
    }
  };

  const debouncedSearch = (query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  const handlePrevSong = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      resetSearchingTimeout(5000);
    }
  };

  const handleNextSong = () => {
    if (selectedIndex < searchResult.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      resetSearchingTimeout(5000);
    }
  };

  const handlePlaySong = () => {
    if (!selectedSong) return;
    onSelectSong?.(selectedSong);
    setSelectedIndex(0);
    setSearchResult([]);
    resetSearchingTimeout(0);
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    handlePlaySong();
  }, [onEnter]);

  useEffect(() => {
    latestSearchRef.current = searching;
    setLoading(true);
    if (searching || openSearchBox) {
      debouncedSearch(searching);
      resetSearchingTimeout(5000);
    } else {
      setSearchResult([]);
      resetSearchingTimeout(0);
      setLoading(false);
    }
    setSelectedIndex(0);
  }, [searching, openSearchBox]);

  useEffect(() => {
    handleNextSong();
  }, [arrowRight]);

  useEffect(() => {
    handlePrevSong();
  }, [arrowLeft]);

  if (searching.length === 0 && !openSearchBox) return null;

  return (
    <div className="hidden lg:block text-white w-full duration-300">
      <div className="pb-2 flex gap-2">
        <Button
          disabled={selectedIndex === 0 || !hasResults}
          onClick={handlePrevSong}
          icon={<IoMdArrowDropleft className="text-lg" />}
          size="xs"
          blur={{
            border: true,
          }}
        >
          ย้อนกลับ
        </Button>

        <Button
          disabled={!hasResults || selectedIndex >= searchResult.length - 1}
          onClick={handleNextSong}
          icon={<IoMdArrowDropright className="text-lg" />}
          size="xs"
          blur={{
            border: true,
          }}
        >
          ต่อไป
        </Button>

        <Button
          disabled={!hasResults}
          onClick={handlePlaySong}
          icon={<MdPlayCircleFilled className="text-lg" />}
          size="xs"
          blur={{
            border: true,
          }}
        >
          เล่น
        </Button>
      </div>

      <div className="w-full blur-overlay flex gap-2 blur-border border rounded-md p-2">
        <div className="p-2 bg-white/20 w-64 overflow-hidden rounded-md flex-none relative">
          <input
            type="text"
            value={searching}
            autoFocus
            className="text-2xl appearance-none focus:!outline-none !bg-transparent px-2"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="h-full flex items-center justify-center mt-3 ml-2">
            <AiOutlineLoading className="text-2xl text-white animate-spin" />
          </div>
        )}

        {/* Not Found State (เพิ่มใหม่) */}
        {!loading && !hasResults && searching.length > 0 && (
          <div className="flex items-center justify-center w-full text-white/60 animate-fadeIn">
            <span>ไม่พบเพลงที่ค้นหา</span>
          </div>
        )}

        {/* Results Found State */}
        {!loading && hasResults && selectedSong && (
          <div
            className={`flex flex-col justify-center w-full ${
              selectedSong.LYRIC_TITLE ? "gap-2" : ""
            }`}
          >
            <div className="flex flex-wrap gap-3 items-center text-2xl animate-fadeIn">
              <SongTypeTag type={selectedSong.SUB_TYPE} />
              <SourceTag from={selectedSong._system}></SourceTag>
              {selectedSong.CODE && (
                <span className="uppercase">{selectedSong.CODE}</span>
              )}
              <span>{selectedSong.TITLE}</span>
              <ArtistTag artist={selectedSong.ARTIST} />
            </div>

            {selectedSong.LYRIC_TITLE && (
              <div className=" w-full h-full text-xs line-clamp-1 text-opacity-80">
                {selectedSong.LYRIC_TITLE}
              </div>
            )}
            {(selectedSong._musicPlayCount !== undefined ||
              selectedSong._musicLike !== undefined ||
              selectedSong._musicUploader !== undefined) && (
              <div className="flex justify-between">
                <div className="flex gap-2 mt-1">
                  {selectedSong._musicPlayCount !== undefined && (
                    <div className="text-xs flex gap-1 items-center opacity-80">
                      <FaPlayCircle className="text-white text-[9px] mt-0.5"></FaPlayCircle>{" "}
                      <span>{selectedSong._musicPlayCount}</span>
                    </div>
                  )}
                  {selectedSong._musicLike !== undefined && (
                    <div className="text-xs flex gap-1 items-center  opacity-80">
                      <AiFillLike className="text-white text-[10px] mt-0.5"></AiFillLike>{" "}
                      <span>{selectedSong._musicLike}</span>
                    </div>
                  )}
                  {selectedSong._musicLike !== undefined && (
                    <div className="text-xs flex gap-1 items-center  opacity-80">
                      <FaUser className="text-white text-[10px] mt-0.5"></FaUser>{" "}
                      <span>
                        โดย{" "}
                        {selectedSong._musicUploader
                          ? selectedSong._musicUploader
                          : "Error"}
                      </span>
                    </div>
                  )}
                </div>
                {/* {selectedSong._system === "PYTHON_API_SYSTEM" && (
                  <div className="hover:underline duration-300 text-xs opacity-80">
                    แจ้งลบ
                  </div>
                )} */}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KaraokeSearchInput;
