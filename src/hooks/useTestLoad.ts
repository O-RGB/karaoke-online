import { useContext } from "react";
import { LoadFileContext } from "../context/test-load-file";

const useTestLoad = () => useContext(LoadFileContext);

export default useTestLoad;
