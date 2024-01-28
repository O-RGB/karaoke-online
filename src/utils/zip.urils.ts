import JSZip from "jszip";

export const extractZipFileWithStreaming = async (
  zipFile: File,
  path: string
) => {
  return await JSZip.loadAsync(zipFile).then((zip) => {
    let selectedFile = zip.file(path);
    return selectedFile?.async("blob").then((blob) => {
      return blob;
    });
  });
};
