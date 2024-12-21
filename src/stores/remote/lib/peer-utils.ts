import { DataConnection } from "peerjs";

export function setupConnectionTimeout(
  conn: DataConnection,
  isSuperUser: boolean,
  set: any
) {
  const peerType = isSuperUser ? "super user peer" : "normal peer";
  const timeoutDuration = 300000; // 5 minutes timeout duration

  let timeoutId: NodeJS.Timeout = setTimeout(() => {
    console.warn(
      `Connection with ${conn.peer} on ${peerType} timed out due to inactivity.`
    );
    conn.close();
    set((state: any) => ({
      connections: state.connections.filter((c: DataConnection) => c !== conn),
    }));
  }, timeoutDuration);

  conn.on("data", () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      console.warn(
        `Connection with ${conn.peer} on ${peerType} timed out due to inactivity.`
      );
      conn.close();
      set((state: any) => ({
        connections: state.connections.filter(
          (c: DataConnection) => c !== conn
        ),
      }));
    }, timeoutDuration);
  });

  conn.on("close", () => {
    clearTimeout(timeoutId);
  });

  conn.on("error", (error) => {
    console.error(
      `Error on connection with ${conn.peer} on ${peerType}:`,
      error
    );
    clearTimeout(timeoutId);
  });
}
