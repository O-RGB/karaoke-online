import { addAllTrie, onSearchList } from "@/lib/trie-search";
import TrieSearch from "trie-search";
import { create } from "zustand";
import useConfigStore from "../config/config-store";

interface TrackListStore {
  tracklist: TrieSearch<SearchResult> | undefined;
  setTracklist: (tracklist: SearchResult[]) => void;
  searchTracklist: (value: string) => Promise<SearchResult[]> | undefined;
  addTracklist: (trackList: SearchResult[]) => void;
  removeTracklist: () => void;
  findSimilarSongs: (song: SongDetail) => SearchResult[];
}

const useTracklistStore = create<TrackListStore>((set, get) => ({
  tracklist: undefined,
  setTracklist: (tracklist: SearchResult[]) => {
    const trie = addAllTrie<SearchResult>(tracklist);
    set(() => ({
      tracklist: trie,
    }));
  },
  addTracklist: (trackList: SearchResult[]) => {
    const { tracklist } = get();

    if (tracklist) {
      const updatedTrie = tracklist;
      trackList.forEach((item) => updatedTrie.add(item));
      set(() => ({
        tracklist: updatedTrie,
      }));
    } else {
      const trie = addAllTrie(trackList);
      set(() => ({
        tracklist: trie,
      }));
    }
  },
  removeTracklist: () => {
    set(() => ({ tracklist: undefined }));
  },
  searchTracklist: async (value: string) => {
    const searchByApi = useConfigStore.getState().config.system?.api;
    let musics: SearchResult[] = [];

    const { tracklist } = get();
    if (tracklist) {
      const client = await onSearchList<SearchResult>(value, tracklist);
      musics.push(...client);
    }

    if (searchByApi && value.length > 0) {
      console.log("api fetching...")
      const res = await fetch(`/api/search?query=${value}`);
      const response: SearchResult[] = await res.json();
      if (response) {
        if (response.length > 0) {
          musics.push(
            ...response.map((t: SearchResult) => ({
              ...t,
              from: "DRIVE_EXTHEME" as TracklistFrom,
            }))
          );
        }
      }
    }

    return musics;
  },

  findSimilarSongs: (song: SongDetail) => {
    const { tracklist } = get();
    console.log("tracklist", tracklist?.keyFields);
    if (!tracklist) return [];
    console.log(song);

    // Perform initial searches
    const nameResults = tracklist.get(song.name);
    const artistResults = tracklist.get(song.artist);

    console.log("", nameResults);
    console.log("", artistResults);

    // Combine and deduplicate results
    const initialResults = Array.from(
      new Set([...nameResults, ...artistResults])
    );

    // Filter results based on similarity
    const similarSongs = initialResults.filter((candidate) => {
      // Condition 1: Exact match by id
      if (song.id === candidate.id) {
        return true;
      }

      // Condition 2: Name + Artist similarity >= 80%
      const originalCombined = (song.name + song.artist).toLowerCase();

      console.log("originalCombined", originalCombined);
      const candidateCombined = (
        candidate.name + candidate.artist
      ).toLowerCase();

      console.log("candidateCombined", candidateCombined);
      const similarity = calculateStringSimilarity(
        originalCombined,
        candidateCombined
      );

      console.log("similarity", similarity);

      return similarity >= 0.8;
    });

    console.log("return", similarSongs);
    return similarSongs;
  },
}));

// Helper function to calculate Levenshtein distance
function levenshteinDistance(a: string, b: string): number {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Helper function to calculate string similarity (0 to 1)
function calculateStringSimilarity(a: string, b: string): number {
  const distance = levenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);
  return 1 - distance / maxLength;
}

export default useTracklistStore;
