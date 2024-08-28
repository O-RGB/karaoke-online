"use client";
import React, { createContext, useEffect, useState } from "react";
import Peer, { DataConnection } from "peerjs";
import { remoteEncodeMessage } from "@/lib/remote";

interface PeerContextType {
  normalPeer: Peer;
  superUserPeer: Peer;
  connectToPeer: (peerId: string, isSuperUser: boolean) => void;
  connections: DataConnection[];
  superUserConnections: DataConnection[];
  sendMessage: (message: any, type: SendType) => void;
  sendSuperUserMessage: (message: any, type: SendType) => void;
  messages?: { from: string; content: RemoteEncode };
  generateQRCode: (isSuperUser: boolean) => string;
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
  generateQRCode: () => "",
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

  useEffect(() => {
    const newPeer = new Peer();
    newPeer.on("open", (id) => {
      setNormalPeer(newPeer);
      newPeer.on("connection", (conn) => {
        setConnections((prev) => [...prev, conn]);
        conn.on("data", (data) => {
          setMessages({ from: conn.peer, content: data });
        });

        setupConnectionTimeout(conn, false);
      });
    });

    const newSuperUserPeer = new Peer();
    newSuperUserPeer.on("open", (id) => {
      setSuperUserPeer(newSuperUserPeer);
      newSuperUserPeer.on("connection", (conn) => {
        setSuperUserConnections((prev) => [...prev, conn]);
        conn.on("data", (data) => {
          setMessages({ from: conn.peer, content: data });
        });

        setupConnectionTimeout(conn, true);
      });
    });

    return () => {
      newPeer.destroy();
      newSuperUserPeer.destroy();
    };
  }, []);

  const setupConnectionTimeout = (
    conn: DataConnection,
    isSuperUser: boolean
  ) => {
    const timeoutDuration = 30000; // 30 seconds timeout duration
    let timeoutId = setTimeout(() => {
      console.log(`Connection with ${conn.peer} timed out`);
      if (isSuperUser) {
        setSuperUserConnections((prev) => prev.filter((c) => c !== conn));
      } else {
        setConnections((prev) => prev.filter((c) => c !== conn));
      }
    }, timeoutDuration);

    conn.on("data", () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log(`Connection with ${conn.peer} timed out`);
        if (isSuperUser) {
          setSuperUserConnections((prev) => prev.filter((c) => c !== conn));
        } else {
          setConnections((prev) => prev.filter((c) => c !== conn));
        }
      }, timeoutDuration);
    });

    conn.on("close", () => {
      clearTimeout(timeoutId);
      if (isSuperUser) {
        setSuperUserConnections((prev) => prev.filter((c) => c !== conn));
      } else {
        setConnections((prev) => prev.filter((c) => c !== conn));
      }
    });
  };

  const connectToPeer = (peerId: string, isSuperUser: boolean) => {
    const peer = isSuperUser ? superUserPeer : normalPeer;
    const conn = peer.connect(peerId);

    conn.on("open", () => {
      conn.send(`Hello from ${peer.id}`);
    });

    conn.on("data", (data) => {
      setMessages({ from: conn.peer, content: data });
    });

    conn.on("close", () => {
      if (isSuperUser) {
        setSuperUserConnections((prev) => prev.filter((c) => c !== conn));
      } else {
        setConnections((prev) => prev.filter((c) => c !== conn));
      }
    });

    conn.on("error", (error) => {
      console.error(`Connection with ${conn.peer} error:`, error);
    });

    if (isSuperUser) {
      setSuperUserConnections((prev) => [...prev, conn]);
    } else {
      setConnections((prev) => [...prev, conn]);
    }

    setupConnectionTimeout(conn, isSuperUser);
  };

  const sendMessage = (message: any, type: SendType) => {
    connections.forEach((conn) => {
      conn.send(remoteEncodeMessage(message, type));
    });
  };

  const sendSuperUserMessage = (message: any, type: SendType) => {
    superUserConnections.forEach((conn) => {
      conn.send(remoteEncodeMessage(message, type));
    });
  };

  const generateQRCode = (isSuperUser: boolean) => {
    return (isSuperUser ? superUserPeer : normalPeer)?.id || "";
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
        generateQRCode,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};
