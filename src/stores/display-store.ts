import { create } from "zustand";

interface DisplayStore {}

const useDisplayStore = create<DisplayStore>((set) => ({}));

export default useDisplayStore;
