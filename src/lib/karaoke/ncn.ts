export const readLyricsFile = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const decoder = new TextDecoder("windows-874");
  const contentUtf8 = decoder.decode(arrayBuffer);
  var lines = contentUtf8.split("\r\n"); // หรือ '\r\n' ตามที่เหมาะสม
  lines = lines.map((data) => data.trim());
  return lines;
};
