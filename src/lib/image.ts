// lib/image.ts

// Function to convert an image file to Base64
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result.toString());
      } else {
        reject("Failed to convert image to base64");
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file); // Read the file as a data URL (Base64)
  });
};

// Function to convert Base64 to a Blob
export const base64ToImage = (base64: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const matches = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return reject("Invalid base64 string");
    }

    const mimeType = matches[1];
    const base64Data = atob(matches[2]);
    const byteNumbers = new Array(base64Data.length);

    for (let i = 0; i < base64Data.length; i++) {
      byteNumbers[i] = base64Data.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    resolve(new Blob([byteArray], { type: mimeType }));
  });
};
