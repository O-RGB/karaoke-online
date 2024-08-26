type SendType = "GIND_NODE" | "SET_CHANNEL";

interface RemoteEncode<> {
  type: SendType;
  data: any;
}
