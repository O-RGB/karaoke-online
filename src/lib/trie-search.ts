import TrieSearch from "trie-search";

const options = {
  ignoreCase: true, // ยังจำเป็นต้องใช้
  splitOnRegEx: /\s+/, // ยังจำเป็นต้องใช้
  min: 0,
  keepAll: false, // ปิดการเก็บข้อมูลทั้งหมด
  cache: false, // ปิด cache เพื่อลดการใช้ memory
  fuzzy: true, // เปิด fuzzy matching
  expandRegexes: [
    {
      regex: /[่้๊๋]/g,
      alternate: "",
    },
  ],
};

export async function addSongList<T = any>(file: File): Promise<TrieSearch<T>> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const contentArrayBuffer = e.target.result;
        let parsedJSON = JSON.parse(contentArrayBuffer) as T[];
        const trie = new TrieSearch<T>(["name", "artist"], options);
        trie.addAll(parsedJSON);
        resolve(trie);
      } catch (error) {}
    };
    reader.readAsText(file as File);
  });
}

export function addAllTrie<T = any>(list: any[]) {
  const trie = new TrieSearch<T>(["name", "artist"], options);
  trie.addAll(list);
  return trie;
}

export async function onSearchList<T = any>(
  value: string,
  trie: TrieSearch<T>,
  limit: number = 20
) {
  return trie?.search(value, undefined, limit);
}
