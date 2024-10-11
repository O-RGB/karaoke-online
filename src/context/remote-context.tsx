"use client";
import React, { createContext, useLayoutEffect, useState } from "react";
import Peer, { DataConnection } from "peerjs";
import { useNotification } from "@/hooks/notification-hook";
import { RiRemoteControlFill } from "react-icons/ri";

interface PeerContextType {
  normalPeer: Peer;
  superUserPeer: Peer;
  connectToPeer: (peerId: string, isSuperUser: boolean) => void;
  connections: DataConnection[];
  superUserConnections: DataConnection[];
  sendMessage: (info: RemoteSendMessage) => void;
  sendSuperUserMessage: (info: RemoteSendMessage) => void;
  received?: RemoteReceivedMessages;
}

export const PeerContext = createContext<PeerContextType>({
  normalPeer: new Peer(),
  superUserPeer: new Peer(),
  connectToPeer: () => {},
  connections: [],
  superUserConnections: [],
  sendMessage: () => {},
  sendSuperUserMessage: () => {},
  received: undefined,
});

export const PeerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Notification
  const { addNotification } = useNotification();

  // NORMAL
  const [normalPeer, setNormalPeer] = useState<Peer>(new Peer());
  const [connections, setConnections] = useState<DataConnection[]>([]);

  // SUPER
  const [superUserPeer, setSuperUserPeer] = useState<Peer>(new Peer());
  const [superUserConnections, setSuperUserConnections] = useState<
    DataConnection[]
  >([]);

  // RECEIVED
  const [received, setReceived] = useState<RemoteReceivedMessages>();

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
          addNotification(
            "มีการเชื่อมต่อ",
            <RiRemoteControlFill></RiRemoteControlFill>
          );
          return [...prev, conn];
        });

        conn.on("data", (data: any) => {
          console.log(`normalPeer received data from ${conn.peer}:`, data);
          setReceived({ from: conn.peer, content: data, user: "NORMAL" });
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
          addNotification(
            "มีการเชื่อมต่อ Admin",
            <RiRemoteControlFill></RiRemoteControlFill>
          );
          return [...prev, conn];
        });

        conn.on("data", (data: any) => {
          console.log(`superUserPeer received data from ${conn.peer}:`, data);
          setReceived({ from: conn.peer, content: data, user: "SUPER" });
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

    conn.on("data", (data: any) => {
      console.log(`Received data from ${peerId} on ${peerType}:`, data);
      setReceived({
        from: conn.peer,
        content: data,
        user: isSuperUser ? "SUPER" : "NORMAL",
      });
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

  const sendMessage = (info: RemoteSendMessage) => {
    console.log(
      `Sending message to all normalPeer connections:`,
      info.message,
      `with type:`,
      info.type
    );
    if (info.clientId) {
      var connection: DataConnection | undefined = undefined;

      var userConnections = [];
      if (info.user == "NORMAL") {
        userConnections = connections;
      } else {
        userConnections = superUserConnections;
      }
      connection = userConnections.find((conn) => conn.peer === info.clientId);

      connection?.send(info);
    } else {
      connections.forEach((conn) => {
        console.log(`Sending message to ${conn.peer} on normalPeer.`);
        conn.send(info);
      });
    }
  };

  const sendSuperUserMessage = (info: RemoteSendMessage) => {
    console.log(
      `Sending message to all superUserPeer connections:`,
      info.message,
      `with type:`,
      info.type
    );
    superUserConnections.forEach((conn) => {
      console.log(`Sending message to ${conn.peer} on superUserPeer.`);
      conn.send(info);
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
        received: received,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};
