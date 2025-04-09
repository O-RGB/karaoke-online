export function toOptions<T = any>({
  value,
  list = [],
  render,
}: {
  list: any[];
  value?: string;
  render?: (callback: T) => React.ReactNode;
}) {
  return list?.map(
    (data) =>
      ({
        value: value ? data[value] : undefined,
        option: data,
        render: render?.(data),
      } as IOptions)
  );
}

/**
 * Capitalizes the first character of a word, or the whole word if specified.
 */
function capitalize(word: string, capitalizeWord: boolean = false): string {
  // ถ้า true ให้พิมพ์ใหญ่ตัวแรก แล้วตามด้วยตัวเล็ก
  return capitalizeWord
    ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    : word.toLowerCase(); // ไม่ให้พิมพ์ใหญ่ ก็แปลงเป็นตัวเล็กธรรมดา
}

export function enumToReadable(
  input: string,
  capitalizeAllWords: boolean = true
): string {
  const words = input.split("_");
  return words
    .map((word, index) => {
      const shouldCapitalize = capitalizeAllWords || index === 0;
      return capitalize(word.toLowerCase(), shouldCapitalize);
    })
    .join(" ");
}

export function lowercaseToReadable(
  input: string,
  capitalizeAllWords: boolean = true
): string {
  const words = input.split("_");
  return words
    .map((word, index) => {
      const shouldCapitalize = capitalizeAllWords || index === 0;
      return capitalize(word, shouldCapitalize);
    })
    .join(" ");
}
