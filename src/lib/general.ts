export function toOptions<T = any>({
  value,
  list,
  render,
}: {
  list: any[];
  value?: string;
  render?: (callback: T) => React.ReactNode;
}) {
  return list.map(
    (data) =>
      ({
        value: value ? data[value] : undefined,
        option: data,
        render: render?.(data),
      } as IOptions)
  );
}
