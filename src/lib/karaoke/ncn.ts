export const readLyricsFile = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const decoder = new TextDecoder("windows-874");
  const contentUtf8 = decoder.decode(arrayBuffer);
  const lines = contentUtf8.split("\r\n"); // หรือ '\r\n' ตามที่เหมาะสม
  console.log(lines)
  return lines;
};
