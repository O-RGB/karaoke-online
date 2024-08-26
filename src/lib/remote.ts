export const remoteDecodeMessage = (
  data: any
): number[] | ISetChannelGain | undefined => {
  const type: SendType = data.type;
  if (!type) {
    return;
  }
  switch (type) {
    case "GIND_NODE":
      return data.data as number[];

    case "SET_CHANNEL":
      return data.data as ISetChannelGain;

    default:
      return data;
  }
};

export const remoteEncodeMessage = (data: any, type: SendType) => {
  return {
    data,
    type,
  };
};
