import { useContext } from "react";
import { SongContext } from "../context/song/song-context";

const useSong = () => useContext(SongContext);

export default useSong;
