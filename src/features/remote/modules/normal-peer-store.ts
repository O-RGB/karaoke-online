import { create } from "zustand";
import Peer, { DataConnection } from "peerjs";
import { setupConnectionTimeout } from "../lib/peer-utils";
import {
  RemoteReceivedMessages,
  RemoteSendMessage,
} from "../types/remote.type";

interface NormalPeerState {
  peer: Peer | null;
  connections: DataConnection[];
  received?: RemoteReceivedMessages;
  connectToPeer: (peerId: string) => void;
  sendMessage: (info: RemoteSendMessage) => void;
  initializePeer: () => void;
}

export const useNormalPeerStore = create<NormalPeerState>((set, get) => ({
  peer: null,
  connections: [],
  received: undefined,

  connectToPeer: (peerId: string) => {
    const { peer } = get();

    if (!peer || !peer.open) {
      console.error(
        `Normal peer is not open yet. Cannot connect to ${peerId}.`
      );
      return;
    }

    const conn = peer.connect(peerId);

    conn.on("open", () => {
      conn.send(`Hello from ${peer.id}`);
    });

    conn.on("data", (data: any) => {
      set({
        received: {
          from: conn.peer,
          content: data,
          user: "NORMAL",
        },
      });
    });

    conn.on("close", () => {
      set((state) => ({
        connections: state.connections.filter((c) => c !== conn),
      }));
    });

    conn.on("error", (error) => {
      console.error(
        `Error in connection with ${peerId} on normal peer:`,
        error
      );
    });

    set((state) => ({
      connections: [...state.connections, conn],
    }));

    setupConnectionTimeout(conn, false, set);
  },

  sendMessage: (info: RemoteSendMessage) => {
    const { connections } = get();

    if (info.clientId) {
      const connection = connections.find(
        (conn) => conn.peer === info.clientId
      );
      connection?.send(info);
    } else {
      connections.forEach((conn) => {
        conn.send(info);
      });
    }
  },

  initializePeer: () => {
    const newPeer = new Peer();

    newPeer.on("open", (id) => {
      set({ peer: newPeer });

      newPeer.on("connection", (conn) => {
        set((state) => ({ connections: [...state.connections, conn] }));

        conn.on("data", (data: any) => {
          set({
            received: { from: conn.peer, content: data, user: "NORMAL" },
          });
        });

        setupConnectionEvents(conn, false, set);
      });
    });
  },
}));

function setupConnectionEvents(
  conn: DataConnection,
  isSuperUser: boolean,
  set: any
) {
  conn.on("open", () => {});

  conn.on("close", () => {
    set((state: NormalPeerState) => ({
      connections: state.connections.filter((c) => c !== conn),
    }));
  });

  conn.on("error", (error) => {
    console.error(
      `Error in connection with ${conn.peer} on normal peer:`,
      error
    );
  });

  setupConnectionTimeout(conn, isSuperUser, set);
}
