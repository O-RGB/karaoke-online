"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import Peer, { DataConnection } from "peerjs";

interface PeerContextType {
  peer?: Peer;
  connectToPeer: (peerId: string) => void;
  connections: DataConnection[];
  sendMessage: (message: string) => void;
  messages: { from: string; content: string }[];
}

export const PeerContext = createContext<PeerContextType>({
  connectToPeer: () => {},
  connections: [],
  sendMessage: () => {},
  messages: [],
});

export const PeerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [peer, setPeer] = useState<Peer>();
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [messages, setMessages] = useState<{ from: string; content: string }[]>(
    []
  );

  useEffect(() => {
    const newPeer = new Peer();
    setPeer(newPeer);

    newPeer.on("connection", (conn) => {
      setConnections((prev) => [...prev, conn]);

      conn.on("data", (data) => {
        console.log("Received data:", data);
        setMessages((prev) => [
          ...prev,
          { from: conn.peer, content: data as string },
        ]);
      });
    });

    return () => {
      newPeer.destroy();
    };
  }, []);

  const connectToPeer = (peerId: string) => {
    if (peer) {
      const conn = peer.connect(peerId);
      setConnections((prev) => [...prev, conn]);

      conn.on("open", () => {
        conn.send("Hello from " + peer.id);
      });

      conn.on("data", (data) => {
        console.log("Received data:", data);
        setMessages((prev) => [
          ...prev,
          { from: conn.peer, content: data as string },
        ]);
      });
    }
  };

  const sendMessage = (message: string) => {
    connections.forEach((conn) => {
      conn.send(message);
      setMessages((prev) => [
        ...prev,
        { from: peer?.id || "You", content: message },
      ]);
    });
  };

  return (
    <PeerContext.Provider
      value={{ peer, connectToPeer, connections, sendMessage, messages }}
    >
      {children}
    </PeerContext.Provider>
  );
};

export const usePeer = () => useContext(PeerContext);
