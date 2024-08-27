import { Archive } from "libarchive.js";

Archive.init({
  workerUrl: "/libarchive.js/worker-bundle.js",
});

export const ExtractFile = async (file: File) => {
  try {
    const archive = await Archive.open(file);
    let decoded = await archive.extractFiles();
    return decoded;
  } catch (error) {
    console.error("Error extracting archive:", error);
  }
};
