import TrieSearch from "trie-search";

export async function addSongList<T = any>(file: File): Promise<TrieSearch<T>> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const contentArrayBuffer = e.target.result;
        let parsedJSON = JSON.parse(contentArrayBuffer) as T[];
        const trie = new TrieSearch<T>(["name", "artist"]);
        trie.addAll(parsedJSON);
        resolve(trie);
      } catch (error) {}
    };
    reader.readAsText(file as File);
  });
}

export async function onSearchList<T = any>(
  value: string,
  trie: TrieSearch<T>,
  limit: number = 10
) {
  return trie?.search(value, undefined, limit);
}
