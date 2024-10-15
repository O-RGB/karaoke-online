interface FeatureSynth {
  updatePreset: (channel: number, value: number) => void;
  updatePitch: (channel: number | null, semitones: number = 1) => void;
  updateMainVolume: (channel: number, vol: number) => void;
  updateMuteVolume: (channel: number, isMuted: boolean) => void
  updateLockedVolume: (channel: number, isLocked: boolean) => void
  updatePanVolume: (channel: number, value: number) => void
  updateReverb: (channel: number, value: number) => void
  updateChorusDepth: (channel: number, value: number) => void
}

interface TrackListStore {
  tracklist: TrieSearch<SearchResult> | undefined;
  setTracklist: (tracklist: TrieSearch<SearchResult> | undefined) => void;
}
