type TypeFormHost = "GIND_NODE" | "VALIDATE_PIN" | "SEND_SONG_LIST";
type TypeFormJoiner =
  | "SET_CHANNEL"
  | "PIN_VALIDATION"
  | "SET_SONG"
  | "SEARCH_SONG";
type SendType = TypeFormJoiner | TypeFormHost;

interface RemoteEncode<T = any> {
  type: SendType;
  data: T;
}
