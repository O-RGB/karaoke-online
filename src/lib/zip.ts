import JSZip from "jszip";

export const extractFile = async (zipFile: File): Promise<File[]> => {
  const zip = new JSZip();
  const fileList: File[] = [];

  await zip.loadAsync(zipFile);
  const entries = Object.values(zip.files);

  for (const zipEntry of entries) {
    if (!zipEntry.dir) {
      const fileContent = await zipEntry.async("blob");
      const file = new File([fileContent], zipEntry.name, {
        type: fileContent.type,
      });
      fileList.push(file);
    }
  }

  return fileList;
};

export const zipFiles = async (
  files: File[],
  zipName: string
): Promise<File | undefined> => {
  const zip = new JSZip();

  files.forEach((file) => {
    zip.file(file.name, file, {
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });
  });

  try {
    const content = await zip.generateAsync({ type: "blob" });
    const zipFile = new File([content], `${zipName}.zip`, {
      type: "application/zip",
    });

    return zipFile;
  } catch (error) {
    console.error("Error while zipping files:", error);
    return undefined;
  }
};

export const addFilesInZip = async (zipFile: File, files: File[]) => {
  const zip = new JSZip();
  try {
    const zipContent = await zip.loadAsync(zipFile);
    files.forEach((file) => {
      zipContent.file(file.name, file);
    });

    const updatedZip = await zipContent.generateAsync({ type: "blob" });

    return updatedZip;
  } catch (error) {
    console.error("Error while adding files to ZIP:", error);
  }
};

export const removeFilesInZip = async (
  zipFile: File,
  filesToRemove: string[]
): Promise<File | undefined> => {
  const zip = new JSZip();
  try {
    const zipContent = await zip.loadAsync(zipFile);

    filesToRemove.forEach((fileName) => {
      zipContent.remove(fileName);
    });

    const updatedZipBlob = await zipContent.generateAsync({ type: "blob" });

    const updatedZipFile = new File([updatedZipBlob], zipFile.name, {
      type: "application/zip",
    });

    return updatedZipFile;
  } catch (error) {
    console.error("Error while removing files from ZIP:", error);
    return undefined;
  }
};
