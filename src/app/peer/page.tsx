"use client";
import React, { useState } from "react";
import { usePeer } from "../hooks/peer-hooks";

interface PeerProps {}

const Peer: React.FC<PeerProps> = ({}) => {
  const { peer, connectToPeer, connections, sendMessage, messages } = usePeer();
  const [remotePeerId, setRemotePeerId] = useState("");
  const [message, setMessage] = useState("");

  const handleConnect = () => {
    connectToPeer(remotePeerId);
  };

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      sendMessage(message);
      setMessage("");
    }
  };
  return (
    <div className="p-4">
      <h1 className="text-2xl">PeerJS Multi-User Connection</h1>
      <div className="my-4">
        <div>
          <strong>Your Peer ID:</strong> {peer?.id || "Connecting..."}
        </div>
        <input
          type="text"
          placeholder="Enter remote peer ID"
          value={remotePeerId}
          onChange={(e) => setRemotePeerId(e.target.value)}
          className="border p-2"
        />
        <button onClick={handleConnect} className="ml-2 p-2 bg-blue-500 text-white">
          Connect
        </button>
      </div>
      <div>
        <h2 className="text-xl">Connected Peers</h2>
        <ul>
          {connections.map((conn, index) => (
            <li key={index}>{conn.peer}</li>
          ))}
        </ul>
      </div>
      <div className="my-4">
        <h2 className="text-xl">Chat</h2>
        <div className="border p-2 h-64 overflow-y-scroll">
          {messages.map((msg, index) => (
            <div key={index}>
              <strong>{msg.from}:</strong> {msg.content}
            </div>
          ))}
        </div>
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-2 w-full"
        />
        <button
          onClick={handleSendMessage}
          className="mt-2 p-2 bg-green-500 text-white w-full"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Peer;
