import React, { useEffect, useRef, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import { MdPlayCircleFilled } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import Button from "../../button/button";
import Tags from "../../display/tags";
import useMixerStoreNew from "@/features/player/event-player/modules/event-mixer-store";
import useKeyboardStore from "@/features/keyboard-state";
import { useKeyboardEvents } from "@/hooks/keyboard-hook";
import {
  ITrackData,
  SoundSubType,
  SoundType,
} from "@/features/songs/types/songs.type";
import { SourceTag } from "@/components/tools/search-song/source-tag";

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

const SongTypeTag = ({ type }: { type?: SoundSubType }) => {
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
  return null;
};

const KaraokeSearchInput: React.FC<KaraokeSearchInputProps> = ({
  onSearch,
  onSelectSong,
}) => {
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<IOptions<ITrackData>[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const hideMixer = useMixerStoreNew((state) => state.hideMixer);

  const { arrowLeft, arrowRight, onEnter, queueing, searching, openSearchBox } =
    useKeyboardEvents();
  const resetSearchingTimeout = useKeyboardStore(
    (state) => state.resetSearchingTimeout
  );

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      setLoading(false);
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
    setLoading(true);
    if (searching || openSearchBox) {
      debouncedSearch(searching);
      resetSearchingTimeout(5000);
    } else {
      setSearchResult([]);
      resetSearchingTimeout(0);
    }
    setSelectedIndex(0);
  }, [searching, openSearchBox]);

  useEffect(() => {
    handleNextSong();
  }, [arrowRight]);

  useEffect(() => {
    handlePrevSong();
  }, [arrowLeft]);

  const positionClass = hideMixer ? "top-32" : "top-64";

  if (searching.length === 0 && !openSearchBox) return;

  return (
    <div
      className={`fixed hidden lg:block text-white w-full px-5 duration-300 ${positionClass}`}
    >
      {/* Navigation controls */}
      <div className="pb-2 flex gap-2">
        <Button
          disabled={selectedIndex === 0 || !hasResults}
          onClick={handlePrevSong}
          icon={<IoMdArrowDropleft className="text-lg" />}
          iconPosition="left"
          className="h-7"
          padding="px-2"
        >
          ย้อนกลับ
        </Button>

        <Button
          disabled={!hasResults || selectedIndex >= searchResult.length - 1}
          onClick={handleNextSong}
          icon={<IoMdArrowDropright className="text-lg" />}
          iconPosition="right"
          className="h-7"
          padding="px-2"
        >
          ต่อไป
        </Button>

        <Button
          disabled={!hasResults || queueing}
          onClick={handlePlaySong}
          icon={<MdPlayCircleFilled className="text-lg" />}
          iconPosition="right"
          className="h-7"
          padding="px-2"
        >
          เล่น
        </Button>
      </div>
      {/* Search box and results */}
      <div className="w-full blur-overlay flex gap-2 blur-border border rounded-md p-2">
        {/* Search query display */}
        <div className="p-2 bg-white/20 w-64 overflow-hidden rounded-md flex-none relative">
          <input
            type="text"
            value={searching}
            autoFocus
            className="text-2xl appearance-none focus:!outline-none !bg-transparent"
          />
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="h-full flex items-center justify-center mt-3">
            <AiOutlineLoading className="text-2xl text-white animate-spin" />
          </div>
        )}

        {/* Selected result display */}
        {hasResults && selectedSong && (
          <div className="flex flex-wrap gap-3 items-center text-2xl animate-fadeIn">
            <SongTypeTag type={selectedSong.SUB_TYPE} />
            <SourceTag from={selectedSong._system}></SourceTag>
            {selectedSong.CODE && (
              <span className="uppercase">{selectedSong.CODE}</span>
            )}
            <span>{selectedSong.TITLE}</span>
            <ArtistTag artist={selectedSong.ARTIST} />
          </div>
        )}
      </div>
    </div>
  );
};

export default KaraokeSearchInput;
