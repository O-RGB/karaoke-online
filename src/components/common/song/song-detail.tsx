import React, { useEffect } from "react";
import Label from "../label";
import Tags from "../tags";

interface SongDetailProps {
  song: SearchResult;
  tagsClassName?: string;
  labelClassName?: string;
  className?: string;
  tagsColor?: ColorType;
}

const SongDetail: React.FC<SongDetailProps> = ({
  song,
  tagsClassName,
  labelClassName,
  className,
  tagsColor,
}) => {
  useEffect(() => {}, [song]);
  return (
    <span className={`flex flex-col gap-2 ${className}`}>
      <Tags className={`${tagsClassName}`} color={tagsColor}>
        {song.id}
      </Tags>
      <span>{song.name}</span>
      <Label headClass={`${labelClassName} bg-blue-500`}>{song.artist}</Label>
    </span>
  );
};

export default SongDetail;
