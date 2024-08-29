export const readCursorFile = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const view = new DataView(arrayBuffer);
  const steps: number[] = [];

  for (let i = 0; i < arrayBuffer.byteLength; i += 2) {
    steps.push(view.getUint16(i, true));
  }
  return steps;
};
