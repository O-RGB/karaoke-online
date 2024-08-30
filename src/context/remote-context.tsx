"use client";
import React, {
  createContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import Peer, { DataConnection } from "peerjs";
import { remoteEncodeMessage } from "@/lib/remote";

interface PeerContextType {
  normalPeer: Peer;
  superUserPeer: Peer;
  connectToPeer: (peerId: string, isSuperUser: boolean) => void;
  connections: DataConnection[];
  superUserConnections: DataConnection[];
  sendMessage: (message: any, type: SendType, clientId?: string) => void;
  sendSuperUserMessage: (message: any, type: SendType) => void;
  messages?: { from: string; content: RemoteEncode };
}

export const PeerContext = createContext<PeerContextType>({
  normalPeer: new Peer(),
  superUserPeer: new Peer(),
  connectToPeer: () => {},
  connections: [],
  superUserConnections: [],
  sendMessage: () => {},
  sendSuperUserMessage: () => {},
  messages: undefined,
});

export const PeerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [normalPeer, setNormalPeer] = useState<Peer>(new Peer());
  const [superUserPeer, setSuperUserPeer] = useState<Peer>(new Peer());
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [superUserConnections, setSuperUserConnections] = useState<
    DataConnection[]
  >([]);
  const [messages, setMessages] = useState<{ from: string; content: any }>();

  useLayoutEffect(() => {
    console.log("Initializing peers...");

    const newPeer = new Peer();
    console.log("Created new normalPeer with temporary ID:", newPeer.id);

    newPeer.on("open", (id) => {
      console.log("normalPeer connection opened with ID:", id);
      setNormalPeer(newPeer);

      newPeer.on("connection", (conn) => {
        console.log("normalPeer received new connection from:", conn.peer);
        setConnections((prev) => {
          console.log("Updating normalPeer connections list.");
          return [...prev, conn];
        });

        conn.on("data", (data) => {
          console.log(`normalPeer received data from ${conn.peer}:`, data);
          setMessages({ from: conn.peer, content: data });
        });

        conn.on("open", () => {
          console.log(`Connection opened with ${conn.peer} on normalPeer.`);
        });

        conn.on("close", () => {
          console.log(`Connection closed with ${conn.peer} on normalPeer.`);
          setConnections((prev) => prev.filter((c) => c !== conn));
        });

        conn.on("error", (error) => {
          console.error(
            `Error in connection with ${conn.peer} on normalPeer:`,
            error
          );
        });

        setupConnectionTimeout(conn, false);
      });
    });

    const newSuperUserPeer = new Peer();
    console.log(
      "Created new superUserPeer with temporary ID:",
      newSuperUserPeer.id
    );

    newSuperUserPeer.on("open", (id) => {
      console.log("superUserPeer connection opened with ID:", id);
      setSuperUserPeer(newSuperUserPeer);

      newSuperUserPeer.on("connection", (conn) => {
        console.log("superUserPeer received new connection from:", conn.peer);
        setSuperUserConnections((prev) => {
          console.log("Updating superUserPeer connections list.");
          return [...prev, conn];
        });

        conn.on("data", (data) => {
          console.log(`superUserPeer received data from ${conn.peer}:`, data);
          setMessages({ from: conn.peer, content: data });
        });

        conn.on("open", () => {
          console.log(`Connection opened with ${conn.peer} on superUserPeer.`);
        });

        conn.on("close", () => {
          console.log(`Connection closed with ${conn.peer} on superUserPeer.`);
          setSuperUserConnections((prev) => prev.filter((c) => c !== conn));
        });

        conn.on("error", (error) => {
          console.error(
            `Error in connection with ${conn.peer} on superUserPeer:`,
            error
          );
        });

        setupConnectionTimeout(conn, true);
      });
    });

    return () => {
      console.log("Cleaning up peers...");
      newPeer.destroy();
      newSuperUserPeer.destroy();
    };
  }, []);

  const setupConnectionTimeout = (
    conn: DataConnection,
    isSuperUser: boolean
  ) => {
    const peerType = isSuperUser ? "superUserPeer" : "normalPeer";
    const timeoutDuration = 300000; // 30 seconds timeout duration
    console.log(
      `Setting up ${timeoutDuration / 1000}s timeout for connection with ${
        conn.peer
      } on ${peerType}.`
    );

    let timeoutId = setTimeout(() => {
      console.warn(
        `Connection with ${conn.peer} on ${peerType} timed out due to inactivity.`
      );
      conn.close();
      if (isSuperUser) {
        setSuperUserConnections((prev) => prev.filter((c) => c !== conn));
      } else {
        setConnections((prev) => prev.filter((c) => c !== conn));
      }
    }, timeoutDuration);

    conn.on("data", () => {
      console.log(
        `Received data from ${conn.peer} on ${peerType}, resetting timeout.`
      );
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.warn(
          `Connection with ${conn.peer} on ${peerType} timed out due to inactivity.`
        );
        conn.close();
        if (isSuperUser) {
          setSuperUserConnections((prev) => prev.filter((c) => c !== conn));
        } else {
          setConnections((prev) => prev.filter((c) => c !== conn));
        }
      }, timeoutDuration);
    });

    conn.on("close", () => {
      console.log(
        `Clearing timeout for ${conn.peer} on ${peerType} due to closure.`
      );
      clearTimeout(timeoutId);
      if (isSuperUser) {
        setSuperUserConnections((prev) => prev.filter((c) => c !== conn));
      } else {
        setConnections((prev) => prev.filter((c) => c !== conn));
      }
    });

    conn.on("error", (error) => {
      console.error(
        `Error on connection with ${conn.peer} on ${peerType}:`,
        error
      );
      clearTimeout(timeoutId);
    });
  };

  const connectToPeer = (peerId: string, isSuperUser: boolean) => {
    const peerType = isSuperUser ? "superUserPeer" : "normalPeer";
    const peer = isSuperUser ? superUserPeer : normalPeer;
    console.log(`Attempting to connect to ${peerId} using ${peerType}.`);

    if (!peer.open) {
      console.error(
        `${peerType} is not open yet. Cannot connect to ${peerId}.`
      );
      return;
    }

    const conn = peer.connect(peerId);

    conn.on("open", () => {
      console.log(`Connection established with ${peerId} on ${peerType}.`);
      conn.send(`Hello from ${peer.id}`);
    });

    conn.on("data", (data) => {
      console.log(`Received data from ${peerId} on ${peerType}:`, data);
      setMessages({ from: conn.peer, content: data });
    });

    conn.on("close", () => {
      console.log(`Connection closed with ${peerId} on ${peerType}.`);
      if (isSuperUser) {
        setSuperUserConnections((prev) => prev.filter((c) => c !== conn));
      } else {
        setConnections((prev) => prev.filter((c) => c !== conn));
      }
    });

    conn.on("error", (error) => {
      console.error(
        `Error in connection with ${peerId} on ${peerType}:`,
        error
      );
    });

    if (isSuperUser) {
      setSuperUserConnections((prev) => {
        console.log(`Adding ${peerId} to superUserConnections list.`);
        return [...prev, conn];
      });
    } else {
      setConnections((prev) => {
        console.log(`Adding ${peerId} to connections list.`);
        return [...prev, conn];
      });
    }

    setupConnectionTimeout(conn, isSuperUser);
  };

  const sendMessage = (message: any, type: SendType, clientId?: string) => {
    console.log(
      `Sending message to all normalPeer connections:`,
      message,
      `with type:`,
      type
    );
    if (clientId) {
      const hostConnection = connections.find((conn) => conn.peer === clientId);
      if (hostConnection) {
        console.log(
          `Sending message to Fixed Client ID ${hostConnection.peer} on normalPeer.`
        );
        hostConnection.send(remoteEncodeMessage(message, type));
      }
    } else {
      connections.forEach((conn) => {
        console.log(`Sending message to ${conn.peer} on normalPeer.`);
        conn.send(remoteEncodeMessage(message, type));
      });
    }
  };

  const sendSuperUserMessage = (message: any, type: SendType) => {
    console.log(
      `Sending message to all superUserPeer connections:`,
      message,
      `with type:`,
      type
    );
    superUserConnections.forEach((conn) => {
      console.log(`Sending message to ${conn.peer} on superUserPeer.`);
      conn.send(remoteEncodeMessage(message, type));
    });
  };

  return (
    <PeerContext.Provider
      value={{
        normalPeer,
        superUserPeer,
        connectToPeer,
        connections,
        superUserConnections,
        sendMessage,
        sendSuperUserMessage,
        messages,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};
