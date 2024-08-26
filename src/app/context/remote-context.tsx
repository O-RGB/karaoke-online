"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import Peer, { DataConnection } from "peerjs";
import { useSynth } from "../hooks/spessasynth-hooks";
import { remoteDecodeMessage, remoteEncodeMessage } from "@/lib/remote";

interface PeerContextType {
  peer?: Peer;
  connectToPeer: (peerId: string) => void;
  connections: DataConnection[];
  sendMessage: (message: any, type: SendType) => void;
  messages?: { from: string; content: RemoteEncode };
  generateQRCode: () => string;
}

export const PeerContext = createContext<PeerContextType>({
  connectToPeer: () => {},
  connections: [],
  sendMessage: () => {},
  messages: undefined,
  generateQRCode: () => "",
});

export const PeerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [peer, setPeer] = useState<Peer>();
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [messages, setMessages] = useState<{ from: string; content: any }>();

  useEffect(() => {
    const newPeer = new Peer();
    newPeer.on("open", (id) => {
      setPeer(newPeer);
      newPeer.on("connection", (conn) => {
        setConnections((prev) => [...prev, conn]);
        conn.on("data", (data) => {
          setMessages({ from: conn.peer, content: data });
        });
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
        setMessages({ from: conn.peer, content: data });
      });
    }
  };

  const sendMessage = (message: any, type: SendType) => {
    connections.forEach((conn) => {
      conn.send(remoteEncodeMessage(message, type));
      // setMessages({
      //   from: conn.peer,
      //   content: remoteEncodeMessage(message, type),
      // });
    });
  };

  const generateQRCode = () => {
    return peer?.id || "";
  };

  return (
    <PeerContext.Provider
      value={{
        peer,
        connectToPeer,
        connections,
        sendMessage,
        messages,
        generateQRCode,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};
