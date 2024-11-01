export const base64ByteToFile = (base64Byte: string, filename?: string) => {
  const byteCharacters = atob(base64Byte);
  const byteNumbers = new Uint8Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const blob = new Blob([byteNumbers], { type: "application/octet-stream" });
  return new File([blob], filename ?? "file");
};

export const bytesToFile = (
  bytes: number[],
  contentType: string,
  filename: string
) => {
  const byteArray = new Uint8Array(bytes);
  const blob = new Blob([byteArray], { type: contentType });
  return new File([blob], filename, { type: contentType });
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1]; // Type assertion to access the result as a string
      resolve(base64String);
    };

    reader.onerror = (error) => reject(error);

    reader.readAsDataURL(file);
  });
};
