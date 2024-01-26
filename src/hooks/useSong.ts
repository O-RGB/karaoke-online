import { useContext } from "react";
import { SongPlayingContext } from "../context/song-playing/song-playing-context";

const useSongPlaying = () => useContext(SongPlayingContext);

export default useSongPlaying;
