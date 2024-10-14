interface FeatureSynth {
  updatePerset: (channel: number, value: number) => void;
  updatePitch: (channel: number | null, semitones: number = 1) => void;
  updateMainVolume: (channel: number, vol: number) => void;
  updateMuteVolume: (channel: number, isMuted: boolean) => void
  uploadLockedVolume: (channel: number, isLocked: boolean) => void
  uploadPanVolume: (channel: number, value: number) => void
}

interface TrackListStore {
  tracklist: TrieSearch<SearchResult> | undefined;
  setTracklist: (tracklist: TrieSearch<SearchResult> | undefined) => void;
}
