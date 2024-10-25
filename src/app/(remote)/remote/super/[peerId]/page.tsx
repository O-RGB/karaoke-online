"use client";
import SuperJoinConnect from "@/components/remote/super/super-join";
import React from "react";

interface RemoteProps {
  params: {
    peerId: string;
  };
}

const Remote: React.FC<RemoteProps> = ({ params }) => {
  const peerId = params.peerId;
  return (
    <>
      <SuperJoinConnect hostId={peerId}></SuperJoinConnect>
    </>
  );
};

export default Remote;
