import JSZip from "jszip";

export const ExtractFile = async (zipFile: File): Promise<File[]> => {
  const zip = new JSZip();
  const fileList: File[] = [];

  try {
    // Load the ZIP file
    await zip.loadAsync(zipFile);

    // Process files inside the ZIP
    const entries = Object.values(zip.files);

    for (const zipEntry of entries) {
      if (!zipEntry.dir) {
        // Read file as Blob
        const fileContent = await zipEntry.async("blob");

        // Create a File object with a default name (or you can use zipEntry.name)
        const file = new File([fileContent], zipEntry.name, {
          type: fileContent.type,
        });

        // Add to fileList
        fileList.push(file);
      }
    }
  } catch (error) {
    console.error("Error processing zip file:", error);
  }

  return fileList;
};
