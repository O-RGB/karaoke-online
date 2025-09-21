"use client";

import React from "react";
import { ProfileDetails } from "../types";
import { FaUser } from "react-icons/fa";
import Button from "@/components/common/button/button";
import { BiLogOut } from "react-icons/bi";
import { TbUserEdit } from "react-icons/tb";

interface ProfileCardProps {
  profile?: ProfileDetails;
  onEdit: () => void;
  onLogout: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onEdit,
  onLogout,
}) => {
  return (
    <div className="flex justify-between">
      <div className="flex items-start gap-3">
        {profile?.image_url ? (
          <img
            src={profile.image_url}
            alt="Profile"
            className="w-10 h-10 object-cover rounded-full border"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            <FaUser></FaUser>
          </div>
        )}

        <div className="flex flex-col justify-center">
          <p className="break-all">
            {profile ? profile.first_name : "Not"}{" "}
            {profile ? profile.last_name : "Authorization"}
          </p>
          <p className="text-gray-700 text-xs break-all -mt-1">
            {profile ? profile.email : "None"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          color="white"
          disabled={!profile}
          onClick={onEdit}
          icon={<TbUserEdit></TbUserEdit>}
        ></Button>
        <Button
          color="white"
          onClick={onLogout}
          icon={<BiLogOut></BiLogOut>}
        ></Button>
      </div>
    </div>
  );
};

export default ProfileCard;
