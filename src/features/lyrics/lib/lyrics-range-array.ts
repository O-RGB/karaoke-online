export type LyricsPosition = "top" | "bottom";
export type LyricsKeyProps = [number, number];

export interface LyricsRangeValueProps<T> {
  value: T;
  tag: LyricsPosition;
}

export interface LyricsRangeProps<T> {
  key: LyricsKeyProps;
  value: LyricsRangeValueProps<T>;
}

export class LyricsRangeArray<T> {
  ranges: LyricsRangeProps<T>[] = [];
  private cache = new Map<number, LyricsRangeValueProps<T> | undefined>();

  push(key: LyricsKeyProps, value: T) {
    const tag = this.calculateTag();
    this.ranges.push({ key, value: { value, tag } });
    this.ranges.sort((a, b) => a.key[0] - b.key[0]);
    this.cache.clear();
  }

  remove(key: LyricsKeyProps) {
    this.ranges = this.ranges.filter(
      (range) => !(range.key[0] === key[0] && range.key[1] === key[1])
    );
    this.cache.clear();
  }

  private calculateTag(): LyricsPosition {
    return this.ranges.length % 2 === 0 ? "top" : "bottom";
  }
  search(
    value: number
  ): { lyrics: LyricsRangeValueProps<T>; index: number } | undefined {
    if (this.cache.has(value)) {
      const cachedValue = this.cache.get(value);
      if (cachedValue) {
        const index = this.ranges.findIndex((r) => r.value === cachedValue);
        return index !== -1 ? { lyrics: cachedValue, index } : undefined;
      }
      return undefined;
    }

    let left = 0,
      right = this.ranges.length - 1;
    let lastValid: LyricsRangeValueProps<T> | undefined = undefined;
    let lastIndex: number | undefined = undefined;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const [min, max] = this.ranges[mid].key;

      if (value >= min && value <= max) {
        this.cache.set(value, this.ranges[mid].value);
        return { lyrics: this.ranges[mid].value, index: mid };
      }
      if (value < min) right = mid - 1;
      else {
        lastValid = this.ranges[mid].value;
        lastIndex = mid;
        left = mid + 1;
      }
    }

    this.cache.set(value, lastValid);
    return lastValid !== undefined && lastIndex !== undefined
      ? { lyrics: lastValid, index: lastIndex }
      : undefined;
  }

  getNext(value: number): LyricsRangeValueProps<T> | undefined {
    let index = this.ranges.findIndex(
      ({ key }) => value >= key[0] && value <= key[1]
    );

    if (index === -1) {
      index = this.ranges.findIndex(({ key }) => value < key[0]);
      if (index === -1) return undefined;
    }

    const range = this.ranges[index + 1];
    if (!range) return undefined;
    return this.ranges[index + 1]?.value;
  }

  getByIndex(index: number): LyricsRangeValueProps<T> | undefined {
    if (index >= 0 && index < this.ranges.length) {
      return this.ranges[index].value;
    }
    return undefined;
  }
}
