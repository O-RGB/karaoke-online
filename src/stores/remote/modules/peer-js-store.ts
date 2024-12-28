// import { DataConnection, Peer } from "peerjs";
// import { create } from "zustand";
// import { useSuperUserPeerStore } from "./super-peer-store";
// import { useNormalPeerStore } from "./normal-peer-store";
// import { RemoteReceivedMessages, RemoteSendMessage } from "../types/remote.type";

// interface PeerState {
//   normalPeer: Peer | null;
//   superUserPeer: Peer | null;
//   connections: DataConnection[];
//   superUserConnections: DataConnection[];
//   received?: RemoteReceivedMessages;
//   connectToPeer: (peerId: string, isSuperUser: boolean) => void;
//   sendMessage: (info: RemoteSendMessage) => void;
//   sendSuperUserMessage: (info: RemoteSendMessage) => void;
//   initializePeers: (isSuperUser?: boolean) => void;
// }

// export const usePeerStore = create<PeerState>((set, get) => ({
//   normalPeer: null,
//   superUserPeer: null,
//   connections: [],
//   superUserConnections: [],
//   received: undefined,

//   connectToPeer: (peerId: string, isSuperUser: boolean) => {
//     if (isSuperUser) {
//       useSuperUserPeerStore.getState().connectToPeer(peerId);
//     } else {
//       useNormalPeerStore.getState().connectToPeer(peerId);
//     }
//   },

//   sendMessage: (info: RemoteSendMessage) => {
//     const normalStore = useNormalPeerStore.getState();
//     normalStore.sendMessage(info);
//   },

//   sendSuperUserMessage: (info: RemoteSendMessage) => {
//     const superUserStore = useSuperUserPeerStore.getState();
//     superUserStore.sendMessage(info);
//   },

//   initializePeers: (isSuperUser?: boolean) => {
//     if (isSuperUser === false || isSuperUser === undefined) {
//       const normalStore = useNormalPeerStore.getState();
//       normalStore.initializePeer();

//       // Subscribe to normal peer store changes
//       useNormalPeerStore.subscribe((state) => {
//         set({
//           normalPeer: state.peer,
//           connections: state.connections,
//           received:
//             state.received?.user === "NORMAL" ? state.received : get().received,
//         });
//       });
//     }

//     if (isSuperUser === true || isSuperUser === undefined) {
//       const superUserStore = useSuperUserPeerStore.getState();
//       superUserStore.initializePeer();

//       // Subscribe to super user peer store changes
//       useSuperUserPeerStore.subscribe((state) => {
//         set({
//           superUserPeer: state.peer,
//           superUserConnections: state.connections,
//           received:
//             state.received?.user === "SUPER" ? state.received : get().received,
//         });
//       });
//     }
//   },
// }));

import { create } from "zustand";
import Peer, { DataConnection } from "peerjs";
import {
  RemoteReceivedMessages,
  RemoteSendMessage,
} from "../types/remote.type";

interface PeerState {
  normalPeer: Peer | null;
  superUserPeer: Peer | null;
  connections: DataConnection[];
  superUserConnections: DataConnection[];
  received?: RemoteReceivedMessages;
  connectToPeer: (peerId: string, isSuperUser: boolean) => void;
  sendMessage: (info: RemoteSendMessage) => void;
  sendSuperUserMessage: (info: RemoteSendMessage) => void;
  initializePeers: (isSuperUser?: boolean) => void;
}

export const usePeerStore = create<PeerState>((set, get) => ({
  normalPeer: null,
  superUserPeer: null,
  connections: [],
  superUserConnections: [],
  received: undefined,

  connectToPeer: (peerId: string, isSuperUser: boolean) => {
    const { normalPeer, superUserPeer } = get();
    const peer = isSuperUser ? superUserPeer : normalPeer;
    const peerType = isSuperUser ? "superUserPeer" : "normalPeer";

    // console.log(`Attempting to connect to ${peerId} using ${peerType}.`);

    if (!peer || !peer.open) {
      console.error(
        `${peerType} is not open yet. Cannot connect to ${peerId}.`
      );
      return;
    }

    const conn = peer.connect(peerId);

    conn.on("open", () => {
      // console.log(`Connection established with ${peerId} on ${peerType}.`);
      conn.send(`Hello from ${peer.id}`);
    });

    conn.on("data", (data: any) => {
      // console.log(`Received data from ${peerId} on ${peerType}:`, data);
      set({
        received: {
          from: conn.peer,
          content: data,
          user: isSuperUser ? "SUPER" : "NORMAL",
        },
      });
    });

    conn.on("close", () => {
      // console.log(`Connection closed with ${peerId} on ${peerType}.`);
      set((state) => ({
        [isSuperUser ? "superUserConnections" : "connections"]: state[
          isSuperUser ? "superUserConnections" : "connections"
        ].filter((c) => c !== conn),
      }));
    });

    conn.on("error", (error) => {
      console.error(
        `Error in connection with ${peerId} on ${peerType}:`,
        error
      );
    });

    set((state) => ({
      [isSuperUser ? "superUserConnections" : "connections"]: [
        ...state[isSuperUser ? "superUserConnections" : "connections"],
        conn,
      ],
    }));

    setupConnectionTimeout(conn, isSuperUser, set);
  },

  sendMessage: (info: RemoteSendMessage) => {
    const { connections, superUserConnections } = get();
    // console.log(
    //   `Sending message to all normalPeer connections:`,
    //   info.message,
    //   `with type:`,
    //   info.type
    // );
    if (info.clientId) {
      const userConnections =
        info.user === "NORMAL" ? connections : superUserConnections;
      const connection = userConnections.find(
        (conn) => conn.peer === info.clientId
      );
      connection?.send(info);
    } else {
      connections.forEach((conn) => {
        // console.log(`Sending message to ${conn.peer} on normalPeer.`);
        conn.send(info);
      });
    }
  },

  sendSuperUserMessage: (info: RemoteSendMessage) => {
    const { superUserConnections } = get();
    // console.log(
    //   `Sending message to all superUserPeer connections:`,
    //   info.message,
    //   `with type:`,
    //   info
    // );
    superUserConnections.forEach((conn) => {
      // console.log(`Sending message to ${conn.peer} on superUserPeer.`);
      conn.send(info);
    });
  },

  initializePeers: (isSuperUser?: boolean) => {
    // console.log("Initializing peers...");

    if (isSuperUser === false || isSuperUser == undefined) {
      const newPeer = new Peer();
      // console.log("Created new normalPeer with temporary ID:", newPeer.id);

      newPeer.on("open", (id) => {
        // console.log("normalPeer connection opened with ID:", id);
        set({ normalPeer: newPeer });

        newPeer.on("connection", (conn) => {
          // console.log("normalPeer received new connection from:", conn.peer);
          set((state) => ({ connections: [...state.connections, conn] }));

          // const { addNotification } = useNotification();
          // addNotification("มีการเชื่อมต่อ", <RiRemoteControlFill />);

          conn.on("data", (data: any) => {
            // console.log(`normalPeer received data from ${conn.peer}:`, data);
            set({
              received: { from: conn.peer, content: data, user: "NORMAL" },
            });
          });

          setupConnectionEvents(conn, false, set);
        });
      });
    }
    if (isSuperUser === true || isSuperUser == undefined) {
      const newSuperUserPeer = new Peer();
      // console.log(
      //   "Created new superUserPeer with temporary ID:",
      //   newSuperUserPeer.id
      // );

      newSuperUserPeer.on("open", (id) => {
        // console.log("superUserPeer connection opened with ID:", id);
        set({ superUserPeer: newSuperUserPeer });

        newSuperUserPeer.on("connection", (conn) => {
          // console.log("superUserPeer received new connection from:", conn.peer);
          set((state) => ({
            superUserConnections: [...state.superUserConnections, conn],
          }));

          // const { addNotification } = useNotification();
          // addNotification("มีการเชื่อมต่อ Admin", <RiRemoteControlFill />);

          conn.on("data", (data: any) => {
            // console.log(`superUserPeer received data from ${conn.peer}:`, data);
            set({
              received: { from: conn.peer, content: data, user: "SUPER" },
            });
          });

          setupConnectionEvents(conn, true, set);
        });
      });
    }
  },
}));

function setupConnectionEvents(
  conn: DataConnection,
  isSuperUser: boolean,
  set: (
    partial: Partial<PeerState> | ((state: PeerState) => Partial<PeerState>)
  ) => void
) {
  const peerType = isSuperUser ? "superUserPeer" : "normalPeer";

  conn.on("open", () => {
    // console.log(`Connection opened with ${conn.peer} on ${peerType}.`);
  });

  conn.on("close", () => {
    // console.log(`Connection closed with ${conn.peer} on ${peerType}.`);
    set((state) => ({
      [isSuperUser ? "superUserConnections" : "connections"]: state[
        isSuperUser ? "superUserConnections" : "connections"
      ].filter((c) => c !== conn),
    }));
  });

  conn.on("error", (error) => {
    console.error(
      `Error in connection with ${conn.peer} on ${peerType}:`,
      error
    );
  });

  setupConnectionTimeout(conn, isSuperUser, set);
}

function setupConnectionTimeout(
  conn: DataConnection,
  isSuperUser: boolean,
  set: (
    partial: Partial<PeerState> | ((state: PeerState) => Partial<PeerState>)
  ) => void
) {
  const peerType = isSuperUser ? "superUserPeer" : "normalPeer";
  const timeoutDuration = 300000; // 5 minutes timeout duration
  // console.log(
  //   `Setting up ${timeoutDuration / 1000}s timeout for connection with ${
  //     conn.peer
  //   } on ${peerType}.`
  // );

  let timeoutId: NodeJS.Timeout = setTimeout(() => {
    console.warn(
      `Connection with ${conn.peer} on ${peerType} timed out due to inactivity.`
    );
    conn.close();
    set((state) => ({
      [isSuperUser ? "superUserConnections" : "connections"]: state[
        isSuperUser ? "superUserConnections" : "connections"
      ].filter((c) => c !== conn),
    }));
  }, timeoutDuration);

  conn.on("data", () => {
    // console.log(
    //   `Received data from ${conn.peer} on ${peerType}, resetting timeout.`
    // );
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      console.warn(
        `Connection with ${conn.peer} on ${peerType} timed out due to inactivity.`
      );
      conn.close();
      set((state) => ({
        [isSuperUser ? "superUserConnections" : "connections"]: state[
          isSuperUser ? "superUserConnections" : "connections"
        ].filter((c) => c !== conn),
      }));
    }, timeoutDuration);
  });

  conn.on("close", () => {
    // console.log(
    //   `Clearing timeout for ${conn.peer} on ${peerType} due to closure.`
    // );
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
