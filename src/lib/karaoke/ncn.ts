export const readLyricsFile = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const decoder = new TextDecoder("windows-874");
  const contentUtf8 = decoder.decode(arrayBuffer);
  var lines = contentUtf8.split("\r\n"); // หรือ '\r\n' ตามที่เหมาะสม
  lines = lines.map((data) => data.trim());
  return lines;
};

export function groupThaiCharacters(text: string): string[][] {
  const groups: string[][] = [];
  let currentGroup: string[] = [];

  // Regular expressions to match Thai consonants, vowels, and tonal marks
  const consonantPattern = /[\u0E01-\u0E2E]/; // พยัญชนะไทย
  const vowelPattern = /[\u0E31-\u0E3A]/; // สระและวรรณยุกต์ที่อยู่บนล่างหรือข้างพยัญชนะ
  const toneMarkPattern = /[\u0E47-\u0E4C]/; // วรรณยุกต์ต่างๆ

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // If character is a consonant, start a new group
    if (consonantPattern.test(char)) {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = [char];
    }
    // If character is a vowel or tone mark, add it to the current group
    else if (vowelPattern.test(char) || toneMarkPattern.test(char)) {
      currentGroup.push(char);
    } else {
      // In case of non-Thai characters, treat them separately
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
        currentGroup = [];
      }
      groups.push([char]);
    }
  }

  // Push the last group if there's any
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}
